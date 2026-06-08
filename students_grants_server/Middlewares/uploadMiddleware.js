import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

const sanitizeName = (name) =>
    name.replace(/[^\w.\-]+/g, '_').slice(0, 80);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // קבצים נשמרים בתיקייה לפי תעודת הזהות של המשתמש המחובר
        const folderKey = req.user?.idNumber || req.user?.id || 'anonymous';
        const userFolder = path.join(UPLOADS_ROOT, String(folderKey));
        fs.mkdirSync(userFolder, { recursive: true });
        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const base = sanitizeName(path.basename(file.originalname, ext));
        cb(null, `${file.fieldname}-${Date.now()}-${base}${ext}`);
    },
});

const allowedMime = new Set([
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
]);

const fileFilter = (req, file, cb) => {
    if (allowedMime.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('סוג קובץ לא נתמך - מותרים PDF/JPG/PNG בלבד'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

export const uploadFields = upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'fatherIdCard', maxCount: 1 },
    { name: 'motherIdCard', maxCount: 1 },
    { name: 'studyApproval', maxCount: 1 },
    { name: 'bankReference', maxCount: 1 },
]);

export default upload;
