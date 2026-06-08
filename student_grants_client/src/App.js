import { useDispatch } from 'react-redux';
import './App.css';
import { Main } from './Main';
import { useEffect } from 'react';
import API from './api';
import { setCurrent } from './redux/userSlice';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        // אם קיים טוקן ב-localStorage או בעוגייה, מאמתים אותו מול השרת ומאחזרים את המשתמש.
        // כך משתמש שחזר נכנס אוטומטית כל עוד הטוקן תקף (אתגר 'שמירת טוקן בעוגיות').
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await API.get('/api/users/check-auth');
                if (response.data?.user) {
                    dispatch(setCurrent({ ...response.data.user, token }));
                }
            } catch {
                // טוקן לא תקף או לא קיים - מנקים כדי להימנע מאינדיקציה שגויה
                localStorage.removeItem('token');
            }
        };
        verifyUser();
    }, [dispatch]);

    return <Main />;
}
export default App;
