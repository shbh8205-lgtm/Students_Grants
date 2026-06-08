import path from 'path';
import Application from '../Models/Application.js';
import User from '../Models/User.js';
import sendStatusEmail from '../Utilities/mailer.js';

const buildFileEntry = (file) => {
    if (!file) return null;
    // path served via express.static('/uploads')
    const relative = path
        .relative(path.join(file.destination, '..'), path.join(file.destination, file.filename))
        .split(path.sep)
        .join('/');
    return {
        originalName: file.originalname,
        path: `/uploads/${relative.replace(/^uploads\//, '')}`,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
    };
};

// GET /api/applications/my-status
export const getStatus = async (req, res) => {
    try {
        const app = await Application.findOne({
            userId: req.user.id,
            isDraft: false,
        }).sort({ submissionDate: -1 });

        if (!app) return res.status(200).json(null);
        return res.status(200).json({ status: app.status, _id: app._id });
    } catch (err) {
        console.error('getStatus error:', err);
        return res.status(500).json({ message: 'שגיאה בשליפת סטטוס' });
    }
};

// GET /api/applications/my-draft
export const getDraft = async (req, res) => {
    try {
        const draft = await Application.findOne({
            userId: req.user.id,
            isDraft: true,
        }).sort({ updatedAt: -1 });

        if (!draft) return res.status(200).json(null);
        return res.status(200).json(draft);
    } catch (err) {
        console.error('getDraft error:', err);
        return res.status(500).json({ message: 'שגיאה בשליפת טיוטה' });
    }
};

// POST /api/applications/submit
export const submitApplication = async (req, res) => {
    try {
        let payload = {};
        if (req.body?.applicationData) {
            try {
                payload = JSON.parse(req.body.applicationData);
            } catch {
                return res.status(400).json({ message: 'נתוני הבקשה אינם תקינים (JSON שבור)' });
            }
        } else {
            payload = req.body || {};
        }

        const newlyUploaded = {
            idCard: buildFileEntry(req.files?.idCard?.[0]),
            fatherIdCard: buildFileEntry(req.files?.fatherIdCard?.[0]),
            motherIdCard: buildFileEntry(req.files?.motherIdCard?.[0]),
            studyApproval: buildFileEntry(req.files?.studyApproval?.[0]),
            bankReference: buildFileEntry(req.files?.bankReference?.[0]),
        };

        const isDraft = Boolean(payload.isDraft);
        const status = isDraft ? 'draft' : 'pending';

        // מצא את הבקשה האחרונה של המשתמש (טיוטה או בקשה שהוגשה בעבר).
        // אם תהיה טיוטה פתוחה - היא תקבל עדיפות כדי שלא ניצור מסמך כפול;
        // אחרת ניקח את הבקשה האחרונה לפי תאריך עדכון.
        let app;
        let existingApp = await Application.findOne({
            userId: req.user.id,
            isDraft: true,
        });
        if (!existingApp) {
            existingApp = await Application.findOne({
                userId: req.user.id,
            }).sort({ updatedAt: -1 });
        }

        // מיזוג קבצים: קבצים שהועלו עכשיו מחליפים את הישנים, השאר נשמרים.
        const existingDocs = existingApp?.documents?.toObject?.() || {};
        const mergedDocs = { ...existingDocs };
        for (const [field, entry] of Object.entries(newlyUploaded)) {
            if (entry) mergedDocs[field] = entry;
        }

        const doc = {
            userId: req.user.id,
            personalInfo: payload.personalInfo,
            familyInfo: payload.familyInfo,
            studyInfo: payload.studyInfo,
            bankInfo: payload.bankInfo,
            emailForUpdates: payload.emailForUpdates,
            submissionDate: payload.submissionDate || new Date(),
            isDraft,
            status,
            documents: mergedDocs,
        };

        if (existingApp) {
            Object.assign(existingApp, doc);
            existingApp.documents = mergedDocs;
            existingApp.markModified('documents');
            app = await existingApp.save();
        } else {
            app = await Application.create(doc);
        }

        if (!isDraft && app.emailForUpdates) {
            try {
                await sendStatusEmail(app.emailForUpdates, 'pending', app._id, true);
            } catch (mailErr) {
                console.error('Email send failed (non-blocking):', mailErr);
            }
        }

        return res.status(201).json({ message: 'הבקשה נשמרה בהצלחה', application: app });
    } catch (err) {
        console.error('submitApplication error:', err);
        return res.status(500).json({ message: 'שגיאה בשמירת הבקשה' });
    }
};

// GET /api/applications/admin/all
// סינון ומיון מתבצעים בצד שרת (Mongo query operators) - לא טוענים את כל המסמכים לזיכרון.
export const adminGetAll = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'אין הרשאת מנהל' });
        }

        const {
            idNumber,
            fromDate,
            toDate,
            sortByDate,
            minSiblings,
            maxSiblings,
            sortByChildren,
            city,
            minTuition,
            maxTuition,
            sortByTuition,
        } = req.query;

        // ספק דורש להציג את כל הבקשות שאינן מאושרות
        const query = { isDraft: false, status: { $ne: 'approved' } };

        // טווח תאריכי הגשה
        if (fromDate || toDate) {
            query.submissionDate = {};
            if (fromDate) query.submissionDate.$gte = new Date(fromDate);
            if (toDate) query.submissionDate.$lte = new Date(toDate);
        }

        // כמות אחים מתחת לגיל 18 - מעלה / מטה
        const siblingsRange = {};
        if (minSiblings !== undefined && minSiblings !== '') {
            siblingsRange.$gte = Number(minSiblings);
        }
        if (maxSiblings !== undefined && maxSiblings !== '') {
            siblingsRange.$lte = Number(maxSiblings);
        }
        if (Object.keys(siblingsRange).length) {
            query['familyInfo.siblingsUnder18'] = siblingsRange;
        }

        // שכר לימוד שנתי - מעלה / מטה
        const tuitionRange = {};
        if (minTuition !== undefined && minTuition !== '') {
            tuitionRange.$gte = Number(minTuition);
        }
        if (maxTuition !== undefined && maxTuition !== '') {
            tuitionRange.$lte = Number(maxTuition);
        }
        if (Object.keys(tuitionRange).length) {
            query['studyInfo.annualTuition'] = tuitionRange;
        }

        // עיר - חיפוש case-insensitive על שדה city ייעודי, עם נפילה לכתובת לבקשות ישנות
        if (city) {
            const escaped = String(city).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const cityRegex = { $regex: escaped, $options: 'i' };
            query.$or = [
                { 'personalInfo.city': cityRegex },
                { 'personalInfo.address': cityRegex },
            ];
        }

        // ת.ז. - שמורה ב-User ולא ב-Application; מחפשים תחילה את המשתמש
        if (idNumber) {
            const user = await User.findOne({ idNumber }).select('_id');
            if (!user) return res.status(200).json([]);
            query.userId = user._id;
        }

        // מיון
        const sort = {};
        if (sortByDate === 'asc' || sortByDate === 'desc') {
            sort.submissionDate = sortByDate === 'asc' ? 1 : -1;
        }
        if (sortByChildren === 'asc' || sortByChildren === 'desc') {
            sort['familyInfo.siblingsUnder18'] = sortByChildren === 'asc' ? 1 : -1;
        }
        if (sortByTuition === 'asc' || sortByTuition === 'desc') {
            sort['studyInfo.annualTuition'] = sortByTuition === 'asc' ? 1 : -1;
        }

        // ספק דורש: לשלוף ממאגר הנתונים רק את הנתונים שעליה להציג בטבלה.
        // עמודות הטבלה: ת.ז, שם משפחה, שם פרטי, מגמה, סטטוס.
        const results = await Application.find(query)
            .populate('userId', 'idNumber firstName lastName')
            .select('userId studyInfo.major status')
            .sort(sort);

        return res.status(200).json(results);
    } catch (err) {
        console.error('adminGetAll error:', err);
        return res.status(500).json({ message: 'שגיאה בשליפת בקשות' });
    }
};

// GET /api/applications/admin/:id - שליפת בקשה מלאה לתצוגת פרטי הבקשה (ללא הטפסים)
export const adminGetById = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'אין הרשאת מנהל' });
        }

        const app = await Application.findById(req.params.id)
            .populate('userId', 'idNumber firstName lastName email');

        if (!app) {
            return res.status(404).json({ message: 'בקשה לא נמצאה' });
        }

        return res.status(200).json(app);
    } catch (err) {
        console.error('adminGetById error:', err);
        return res.status(500).json({ message: 'שגיאה בשליפת בקשה' });
    }
};

// PATCH /api/applications/:id/status
export const updateStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'אין הרשאת מנהל' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'סטטוס לא חוקי' });
        }

        const app = await Application.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!app) return res.status(404).json({ message: 'בקשה לא נמצאה' });

        if (app.emailForUpdates) {
            try {
                await sendStatusEmail(app.emailForUpdates, status, app._id, false);
            } catch (mailErr) {
                console.error('Email send failed (non-blocking):', mailErr);
            }
        }

        return res.status(200).json({ message: 'הסטטוס עודכן', application: app });
    } catch (err) {
        console.error('updateStatus error:', err);
        return res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
    }
};
