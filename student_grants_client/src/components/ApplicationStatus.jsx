import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../api";
import Cookies from 'js-cookie';

const STATUS_CONTENT = {
    pending: {
        badge: 'בבדיקה',
        title: 'הבקשה נמצאת בבדיקה',
        body: 'בקשתך התקבלה במערכת ונמצאת בבדיקה מקצועית של ועדת המלגות. תהליך הבדיקה אורך בדרך כלל מספר ימי עבודה. עם סיום הבדיקה יישלח אליך עדכון לכתובת הדוא"ל שמסרת.'
    },
    approved: {
        badge: 'אושרה',
        title: 'הבקשה אושרה',
        body: 'ועדת המלגות אישרה את בקשתך לסיוע במימון הלימודים. פרטים נוספים על אופן ההעברה והמועדים יישלחו אליך בנפרד בדוא"ל. אין צורך בפעולה נוספת מצידך בשלב זה.'
    },
    rejected: {
        badge: 'נדחתה',
        title: 'הבקשה לא אושרה',
        body: 'לאחר בחינה מקצועית, בקשתך לא אושרה במחזור הנוכחי. ניתן לפנות לצוות המערכת לקבלת הסבר מפורט על נימוקי ההחלטה, או להגיש בקשה חדשה במחזור הבא.'
    },
    draft: {
        badge: 'טיוטה',
        title: 'הבקשה שמורה כטיוטה',
        body: 'הבקשה נשמרה כטיוטה ועדיין לא הוגשה לבדיקת ועדת המלגות. ניתן להשלים את מילוי הטופס ולשלוח אותו לבדיקה דרך תפריט "הגשת בקשה".'
    }
};

const EMPTY_CONTENT = {
    badge: 'אין בקשה',
    title: 'לא נמצאה בקשה במערכת',
    body: 'תחת חשבון זה טרם הוגשה בקשה לסיוע במימון לימודים. ניתן לפתוח בקשה חדשה דרך תפריט "הגשת בקשה" שבסרגל הניווט.'
};

const UNKNOWN_CONTENT = {
    badge: 'לא ידוע',
    title: 'סטטוס לא ידוע',
    body: 'לא ניתן להציג את סטטוס הבקשה כעת. אם המצב נמשך, נא לפנות לתמיכת המערכת.'
};

const getStatusClass = (status) => {
    switch (status) {
        case 'approved': return 'status-approved';
        case 'pending':  return 'status-pending';
        case 'rejected': return 'status-rejected';
        case 'draft':    return 'status-pending';
        default:         return 'status-pending';
    }
};

export const ApplicationStatus = () => {
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = useSelector(state => state.user?.current?.token || state.user?.token) || Cookies.get('token');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        API.get('/api/applications/my-status', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setApp(res.data))
            .catch(() => setApp(null))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="status-page">
                <div className="status-panel">
                    <p className="status-body">טוען את פרטי הבקשה...</p>
                </div>
            </div>
        );
    }

    const content = !app
        ? EMPTY_CONTENT
        : (STATUS_CONTENT[app.status] || UNKNOWN_CONTENT);

    const statusClass = !app ? 'status-pending' : getStatusClass(app.status);

    return (
        <div className="status-page">
            <div className="status-panel">
                <span className={`status-badge ${statusClass}`}>{content.badge}</span>
                <h2 className="status-title">{content.title}</h2>
                <p className="status-body">{content.body}</p>
            </div>
        </div>
    );
};
