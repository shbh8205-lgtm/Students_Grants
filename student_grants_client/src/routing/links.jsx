import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { setCurrent } from "../redux/userSlice";
import { resetCurrentApplication } from "../redux/requestSlice";

import swal from 'sweetalert';
import API from '../api';

export const Links = () => {
    const userName = useSelector((state) => state.user?.current.firstName || 'אורח');
    const dispatch = useDispatch()
    const navigate = useNavigate();
    return (
        <nav className="navbar-wrapper sticky-header">
            <div className="navbar-container">

                {/* קבוצה ימנית: לוגו טקסטואלי + קישורים */}
                <div className="nav-right-group">
                    <div className="logo-text-container">
                        <span className="logo-letter">M</span>
                        <span className="logo-main-text">מלגות<span className="logo-dot">.</span>App</span>
                    </div>

                    <div className="nav-links">
                        <NavLink to='home' className='nav-link'>בית</NavLink>
                        <NavLink to='logIn' className='nav-link'>התחברות</NavLink>
                        <NavLink to='form' className='nav-link'>הגשת בקשה</NavLink>
                        <NavLink to='status' className='nav-link'>צפיה בסטטוס</NavLink>
                        <NavLink to='requestPage' className='nav-link'>צפיה בבקשות</NavLink>
                    </div>
                </div>

                {/* צד שמאל: פרופיל משתמש (מבוסס Redux) */}
                <div className="nav-user-info">
                    <span className="user-name">שלום, {userName}</span>
                    <div className="user-avatar">{userName.charAt(0)}</div>
                    <u onClick={() => {
                        API.post('/api/users/logout', {})
                        dispatch(setCurrent({}))
                        dispatch(resetCurrentApplication());
                        navigate('/login');
                        swal('', 'התנתקת בהצלחה!', 'success');
                    }
                    }>התנתק</u>
                </div>

            </div>
        </nav>
    );
}