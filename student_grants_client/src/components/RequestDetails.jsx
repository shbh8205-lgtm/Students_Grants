import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import swal from "sweetalert";
import API from "../api";

export const RequestDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const currentUser = useSelector(state => state.user?.current);
    const adminId = currentUser?.idNumber || "329178131";

    // תמיכה בשני מקורות נתונים - אובייקט מלא או רק id (ניווט ספק-תואם מהטבלה).
    const initialData = location.state?.data || null;
    const appId = location.state?.id || initialData?._id;

    const [appData, setAppData] = useState(initialData);
    const [loading, setLoading] = useState(!initialData && Boolean(appId));
    const [previewFile, setPreviewFile] = useState(null);

    const fileApiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const documentLabels = {
        idCard: 'ת"ז סטודנט',
        fatherIdCard: 'ת"ז אב',
        motherIdCard: 'ת"ז אם',
        studyApproval: 'אישור לימודים',
        bankReference: 'אישור ניהול חשבון',
    };

    useEffect(() => {
        if (appData || !appId) return;
        API.get(`/api/applications/admin/${appId}`)
            .then(res => setAppData(res.data))
            .catch(err => {
                console.error(err);
                swal('שגיאה', 'לא ניתן לטעון את פרטי הבקשה', 'error');
            })
            .finally(() => setLoading(false));
    }, [appId, appData]);

    if (loading) return <p style={{ textAlign: 'center' }}>טוען נתונים...</p>;
    if (!appData) return <p style={{ textAlign: 'center' }}>לא נמצאו נתונים להצגה</p>;

    const updateStatus = async (newStatus) => {
        try {
            await API.patch(`/api/applications/${appData._id}/status`,
                { status: newStatus },
                { headers: { 'user-id': adminId } }
            );
            navigate('/requestPage');
            swal('הצלחה', `הסטטוס עודכן ל-${newStatus}`, 'success');
        } catch (err) {
            console.error(err);
            swal('שגיאה', 'העדכון נכשל - וודא שיש לך הרשאות מתאימות', 'error');
        }
    };

    return (
        <div style={{ padding: '20px', direction: 'rtl' }}>
            <h2>פרטי בקשה מלאים</h2>

            <h4>בקשה מאת: {appData.userId?.firstName} {appData.userId?.lastName}</h4>
            <p>תעודת זהות: {appData.userId?.idNumber}</p>
            <p>סטטוס נוכחי: <strong style={{ color: 'blue' }}>{appData.status}</strong></p>
            <p>טלפון נייד: {appData.personalInfo?.mobilePhone}{appData.personalInfo?.homePhone ? ` | נייח: ${appData.personalInfo.homePhone}` : ''}</p>
            <p>עיר: {appData.personalInfo?.city} | כתובת: {appData.personalInfo?.address}</p>

            <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <details open style={{ marginBottom: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>💳 פרטי בנק</summary>
                    <p>בעל החשבון: {appData.bankInfo?.accountOwnerId}</p>
                    <p>בנק: {appData.bankInfo?.bankName} (סניף {appData.bankInfo?.branchNumber})</p>
                    <p>מספר חשבון: {appData.bankInfo?.accountNumber}</p>
                </details>

                <details style={{ marginBottom: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>👨‍👩‍👧‍👦 פרטי משפחה</summary>
                    <p>שם אב: {appData.familyInfo?.father?.firstName} {appData.familyInfo?.father?.lastName}</p>
                    <p>שם אם: {appData.familyInfo?.mother?.firstName} {appData.familyInfo?.mother?.lastName}</p>
                    <p>מספר אחים מתחת ל-18: {appData.familyInfo?.siblingsUnder18}</p>
                    <p>אחים מעל גיל 21 עם יותר מילד: {appData.familyInfo?.siblingsOver21WithMultipleChildren}</p>
                </details>

                <details style={{ marginBottom: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🎓 לימודים</summary>
                    <p>מוסד לימודים: {appData.studyInfo?.institution}</p>
                    <p>מגמה: {appData.studyInfo?.major}</p>
                    <p>שכר לימוד שנתי: {appData.studyInfo?.annualTuition} ש"ח</p>
                </details>

                <details style={{ marginBottom: '10px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>📄 טפסים שצורפו</summary>
                    {Object.entries(documentLabels).map(([key, label]) => {
                        const file = appData.documents?.[key];
                        if (!file) {
                            return (
                                <p key={key} style={{ margin: '6px 0', color: '#888' }}>
                                    <strong>{label}:</strong> לא הועלה
                                </p>
                            );
                        }
                        return (
                            <div key={key} style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <strong>{label}:</strong>
                                <span>{file.originalName}</span>
                                <button
                                    onClick={() => setPreviewFile(file)}
                                    style={{ padding: '4px 12px', cursor: 'pointer' }}
                                >
                                    תצוגה מקדימה
                                </button>
                                <a
                                    href={`${fileApiBase}${file.path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: '13px' }}
                                >
                                    פתח בלשונית חדשה
                                </a>
                            </div>
                        );
                    })}
                </details>
            </div>

            {previewFile && (
                <div
                    onClick={() => setPreviewFile(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            direction: 'rtl',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '20px' }}>
                            <strong style={{ wordBreak: 'break-word' }}>{previewFile.originalName}</strong>
                            <button onClick={() => setPreviewFile(null)} style={{ padding: '4px 12px' }}>
                                סגור ✕
                            </button>
                        </div>
                        {previewFile.mimeType?.startsWith('image/') ? (
                            <img
                                src={`${fileApiBase}${previewFile.path}`}
                                alt={previewFile.originalName}
                                style={{ maxWidth: '80vw', maxHeight: '70vh', display: 'block' }}
                            />
                        ) : previewFile.mimeType === 'application/pdf' ? (
                            <iframe
                                src={`${fileApiBase}${previewFile.path}`}
                                title={previewFile.originalName}
                                style={{ width: '80vw', height: '70vh', border: '1px solid #ccc' }}
                            />
                        ) : (
                            <p>
                                לא ניתן להציג תצוגה מקדימה לסוג קובץ זה.{' '}
                                <a href={`${fileApiBase}${previewFile.path}`} target="_blank" rel="noreferrer">הורד את הקובץ</a>
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button
                    style={{ backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '12px 25px', cursor: 'pointer', borderRadius: '4px' }}
                    onClick={() => updateStatus('rejected')}
                >
                    דחה בקשה
                </button>

                <button
                    style={{ backgroundColor: '#5cb85c', color: 'white', border: 'none', padding: '12px 25px', cursor: 'pointer', borderRadius: '4px' }}
                    onClick={() => updateStatus('approved')}
                >
                    אשר בקשה
                </button>
            </div>
        </div>
    );
};
