import express from 'express';
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentByToken
} from '../controllers/studentController';
import {authMiddleware} from '../middleware/authMiddleware';

const router = express.Router();

// Public route (no auth required)
router.get('/token/:token', getStudentByToken);

// All routes below this will require authentication
router.use(authMiddleware); 

// Protected routes
router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;