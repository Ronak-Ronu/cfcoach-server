import { Request, Response } from 'express';
import Student, { IStudent } from '../models/Student';
import { syncCodeforcesData } from '../utils/codeforcesSync';
import Teacher from '../models/Coach';
import * as nodemailer from 'nodemailer';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: { id: string };
}

const generateProfileToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email with profile URL
const sendProfileEmail = async (student: IStudent, teacherName: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  const profileUrl = `${process.env.FRONTEND_URL}/student/token/${student.profileToken}`;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Code Coach" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: `Your Code Coach Profile Access`,
      html: `
        <h3>Hello ${student.name},</h3>
        <p>Your coach ${teacherName} has created a profile for you on Code Coach.</p>
        <p>Access your profile here: <a href="${profileUrl}">${profileUrl}</a></p>
        <p>This link is permanent and gives you direct access to your profile.</p>
        <p>Best regards,<br/>The Code Coach Team</p>
      `,
    });
    
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, email, codeforcesHandle } = req.body;
    if (!name || !email || !codeforcesHandle) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const teacherId = req.user?.id;
    const profileToken = generateProfileToken();


    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }

    const student = new Student({ name, email, codeforcesHandle, teacherId, profileToken });
    await student.save();

    try {
      await syncCodeforcesData((student._id as string).toString());
      console.log(`Triggered sync for ${codeforcesHandle}`);
    } catch (error: unknown) {
      console.error(`Sync failed for ${codeforcesHandle}:`, error);
    }

    const teacher = await Teacher.findById(teacherId);
    if (teacher) {
      try {
        await sendProfileEmail(student, teacher.name);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue with response but include warning
        return res.status(201).json({
          ...student.toObject(),
          warning: 'Student created but email notification failed'
        });
      }
    }
    res.status(201).json(student);
  } catch (error: unknown) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }
    const students = await Student.find({ teacherId });
    res.json(students);
  } catch (error: unknown) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, email, codeforcesHandle } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }

    const student = await Student.findOneAndUpdate(
      { _id: id, teacherId },
      { name, email, codeforcesHandle },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const shouldResendEmail = email !== student.email || codeforcesHandle !== student.codeforcesHandle;

    if (shouldResendEmail) {
      student.profileToken = generateProfileToken();
      const teacher = await Teacher.findById(teacherId);
      if (teacher) {
        await sendProfileEmail(student, teacher.name);
      }
    }

    res.json(student);
  } catch (error: unknown) {
    console.error('Update student error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


export const deleteStudent = async (req: AuthRequest, res: Response) : Promise<any>=> {
  try {
    const { id } = req.params;
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }
    const student = await Student.findOneAndDelete({ _id: id, teacherId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error: unknown) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response):Promise<any> => {
  try {
    const { id } = req.params;
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized: No teacher ID' });
    }
    const student = await Student.findOne({ _id: id, teacherId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error: unknown) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
  }
};


export const getStudentByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const student = await Student.findOne({ profileToken: token }).populate('teacherId', 'name');
    if (!student) {
      return res.status(404).json({ message: 'Invalid or expired profile link' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student profile', error });
  }
};