import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Teacher from '../models/Coach';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  try {
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      res.status(400).json({ message: 'Teacher already exists' });
      return;
    }

    const teacher = new Teacher({ email, password, name });
    await teacher.save();

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = (req: Request, res: Response): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    res.status(200).json({ message: 'Token valid', userId: decoded.id });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};