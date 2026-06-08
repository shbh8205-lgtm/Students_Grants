import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const extractToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    if (req.cookies?.token) return req.cookies.token;
    return null;
};

export const checkAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ message: 'לא נמצא טוקן הזדהות' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'משתמש לא קיים' });
        }

        req.user = {
            id: user._id.toString(),
            _id: user._id,
            idNumber: user.idNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'הטוקן פג תוקף' });
        }
        return res.status(401).json({ message: 'טוקן לא תקין' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'אין הרשאת מנהל' });
    }
    next();
};

export const signToken = (user) =>
    jwt.sign(
        { id: user._id.toString(), role: user.role, idNumber: user.idNumber },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
