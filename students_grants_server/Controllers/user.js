import bcrypt from 'bcrypt';
import User from '../Models/User.js';
import { signToken } from '../Middlewares/auth.js';

const SALT_ROUNDS = 10;

const sanitizeUser = (user) => ({
    id: user._id.toString(),
    idNumber: user.idNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
});

export const register = async (req, res) => {
    try {
        const { idNumber, firstName, lastName, email, password } = req.body;

        if (!idNumber || !firstName || !lastName || !password) {
            return res.status(400).json({ message: 'יש למלא את כל השדות החובה' });
        }

        const existing = await User.findOne({ idNumber });
        if (existing) {
            return res.status(409).json({ message: 'משתמש עם תעודת זהות זו כבר קיים' });
        }

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create({
            idNumber,
            firstName,
            lastName,
            email,
            password: hashed,
        });

        const token = signToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            user: sanitizeUser(user),
            token,
        });
    } catch (err) {
        console.error('register error:', err);
        return res.status(500).json({ message: 'שגיאה ברישום משתמש' });
    }
};

export const login = async (req, res) => {
    try {
        const { idNumber, password } = req.body;

        if (!idNumber || !password) {
            return res.status(400).json({ message: 'יש להזין תעודת זהות וסיסמה' });
        }

        const user = await User.findOne({ idNumber });
        if (!user) {
            return res.status(401).json({ message: 'פרטי הזדהות שגויים' });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: 'פרטי הזדהות שגויים' });
        }

        const token = signToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            user: sanitizeUser(user),
            token,
        });
    } catch (err) {
        console.error('login error:', err);
        return res.status(500).json({ message: 'שגיאה בהתחברות' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'התנתקת בהצלחה' });
    } catch (err) {
        console.error('logout error:', err);
        return res.status(500).json({ message: 'שגיאה בהתנתקות' });
    }
};
