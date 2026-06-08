import express from 'express';
import { checkAuth } from '../Middlewares/auth.js';
import multer from 'multer';
import { uploadFields } from "../Middlewares/uploadMiddleware.js"
import { getStatus, getDraft, submitApplication, adminGetAll, adminGetById, updateStatus } from '../Controllers/application.js';

const router = express.Router();

// 1. קבלת סטטוס הבקשה האחרונה של המשתמש
router.get('/my-status', checkAuth, getStatus);

// 2. שליפת טיוטה קיימת
router.get('/my-draft', checkAuth, getDraft);

// שימוש בזיכרון (Memory) כדי להעביר את ה-Buffer הלאה לשרת הבא
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 3. הגשת בקשה או שמירת טיוטה
router.post('/submit', checkAuth, uploadFields, submitApplication);

// 4. נתיב מנהל - צפייה בכל הבקשות (טבלה מצומצמת)
router.get('/admin/all', checkAuth, adminGetAll);

// 5. נתיב מנהל - שליפת בקשה אחת בפרטים מלאים
router.get('/admin/:id', checkAuth, adminGetById);

// 6. עדכון סטטוס על ידי מנהל
router.patch('/:id/status', checkAuth, updateStatus);

export default router;