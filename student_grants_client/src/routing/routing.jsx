import { Route, Routes } from "react-router";
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home } from '../components/Home';
import { Login } from '../components/Login';
import { SignUp } from '../components/SignUp';
import { RequestForm } from '../form/RequestForm';
import AdminDashboard from '../components/AdminDashboard';
import { ApplicationStatus } from '../components/ApplicationStatus';
import { RequestDetails } from '../components/RequestDetails';

// שומרי-נתיבים: מבטיחים שמשתמש שאינו מזוהה ינותב להרשמה/התחברות.
const RequireAuth = ({ children }) => {
    const user = useSelector(state => state.user?.current);
    if (!user?.idNumber) {
        return <Navigate to="/logIn" replace />;
    }
    return children;
};

// ספציפי לאדמין - דף ניהול הבקשות.
const RequireAdmin = ({ children }) => {
    const user = useSelector(state => state.user?.current);
    if (!user?.idNumber) return <Navigate to="/logIn" replace />;
    if (user.role !== 'admin') return <Navigate to="/home" replace />;
    return children;
};

// ניתוב ברירת-מחדל מ-/  לפי מצב הזיהוי
const RootRedirect = () => {
    const user = useSelector(state => state.user?.current);
    return <Navigate to={user?.idNumber ? '/home' : '/logIn'} replace />;
};

export const Routing = () => {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="home" element={<Home />} />
            {/* טופס הבקשה גלוי לכולם, אך הגשה בפועל דורשת זיהוי (נאכף בצד השרת) */}
            <Route path="form" element={<RequestForm />} />
            <Route path="logIn" element={<Login />} />
            <Route path="signUp" element={<SignUp />} />

            {/* דורש זיהוי */}
            <Route path="status" element={<RequireAuth><ApplicationStatus /></RequireAuth>} />

            {/* דורש זיהוי + הרשאת מנהל */}
            <Route path="requestPage" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="ShowRequest" element={<RequireAdmin><RequestDetails /></RequireAdmin>} />
        </Routes>
    );
};
