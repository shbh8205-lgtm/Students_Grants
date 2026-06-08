import React, { useState } from 'react';
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setCurrent } from "../redux/userSlice";
import API from "../api";
import swal from "sweetalert";
import { saveStepData } from "../redux/requestSlice";

export const SignUp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        idNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // בדיקה שכל השדות מלאים
        if (!formData.idNumber || !formData.firstName || !formData.lastName || !formData.password) {
            return swal("שגיאה", "יש למלא את כל הפרטים", "error");
        }

        try {
            // שליחה לשרת
            const response = await API.post('/api/users/register', formData);

            if (response.status === 201) {
                swal("מזל טוב!", "החשבון נוצר בהצלחה", "success");

                // עדכון ה-Redux
                const user = response.data.user;
                dispatch(setCurrent({...user, token: response.data.token}));

                dispatch(saveStepData({ step: 'all', data: {} }));
                navigate('/home');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "שגיאה בתקשורת עם השרת";
            swal("אופס...", errorMsg, "error");
        }
    };

    return (
        <div className="signup-container">
            <div className="auth-card">
                <h1 className="auth-title">פתיחת חשבון</h1>
                <p className="auth-subtitle">מילוי הפרטים הבאים נדרש לרישום למערכת.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <input name="firstName" placeholder="שם פרטי" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input name="lastName" placeholder="שם משפחה" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input name="idNumber" placeholder="תעודת זהות" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <input name="password" type="password" placeholder="סיסמה" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn-submit">יצירת חשבון</button>
                </form>

                <div className="auth-divider"><span>או</span></div>

                <button className="btn-link" onClick={() => navigate('/Login')}>
                    כבר רשומים במערכת? <strong>לכניסה</strong>
                </button>
            </div>
        </div>
    );
};