import { checkAuth } from '../Middlewares/auth.js';
import express from 'express';
import { register, login, logout } from '../Controllers/user.js';

const router = express.Router();

router.get('/check-auth', checkAuth, (req, res) => {
    // אם הגענו לכאן, ה-Middleware עבר בהצלחה ו-req.user מכיל את פרטי המשתמש
    res.status(200).send({ 
        isAuthenticated: true, 
        user: req.user 
    });
});
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;