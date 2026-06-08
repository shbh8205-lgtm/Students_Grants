import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { resetCurrentApplication } from "../redux/requestSlice";
import swal from "sweetalert";
import API from "../api";
import { useState } from "react";

export const VerifyForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const request = useSelector(state => state.request);
    const currentUser = useSelector(state => state.user.current);

    const check = () => {
        if (!request) return false;

        const hasPersonal = request.selfDetails?.phone && request.selfDetails?.city;
        const hasFamily = request.familyDetails?.fatherName && request.familyDetails?.motherName;
        const hasBank = request.bankDetails?.bank && request.bankDetails?.num;
        const hasStudies = request.studies?.Trend && request.studies?.Price && request.studies?.institution;
        const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        const areSiblingsValid = request.familyDetails?.siblings?.every(s =>
            s.idNumber && s.firstName && s.lastName && s.birthDate
        ) ?? true;

        return hasPersonal && hasFamily && hasBank && hasStudies && hasEmail && areSiblingsValid;
    };

    const prepareData = (isDraftStatus) => {
        const siblings = request.familyDetails?.siblings || [];

        // חישוב אוטומטי של מספר האחים מתחת לגיל 18 על סמך תאריך הלידה
        const countUnder18 = siblings.filter(s => {
            const age = new Date().getFullYear() - new Date(s.birthDate).getFullYear();
            return age < 18;
        }).length;

        return {
            userId: currentUser?.id,

            personalInfo: {
                idNumber: request.selfDetails?.id,
                mobilePhone: request.selfDetails?.phone,
                homePhone: request.selfDetails?.homePhone,
                birthDate: request.selfDetails?.birthDate,
                city: request.selfDetails?.city,
                address: request.selfDetails?.address?.formatted_address || request.selfDetails?.address,
                zipCode: request.selfDetails?.zipcode
            },

            familyInfo: {
                father: { firstName: request.familyDetails?.fatherName },
                mother: { firstName: request.familyDetails?.motherName },
                siblingsUnder18: countUnder18,
                siblingsOver21WithMultipleChildren: Number(request.familyDetails?.siblingsOver21Multi) || 0,
                siblingsList: siblings.map(s => ({
                    idNumber: s.idNumber,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    birthDate: s.birthDate
                })),
            },

            studyInfo: {
                institution: request.studies?.institution,
                major: request.studies?.Trend,
                annualTuition: Number(request.studies?.Price) || 0,
                yearsOfStudy: Number(request.studies?.num) || 0
            },

            bankInfo: {
                accountOwnerId: request.bankDetails?.id,
                bankName: request.bankDetails?.bank,
                branchNumber: request.bankDetails?.numSnif,
                accountNumber: request.bankDetails?.num
            },

            isDraft: isDraftStatus,
            submissionDate: new Date(),
            emailForUpdates: email
        };
    };

    const finish = async () => {
        if (check()) {
            try {
                const finalData = prepareData(false);
                const formData = new FormData();

                formData.append('applicationData', JSON.stringify(finalData));

                // קבצים שכבר נשמרו בטיוטה הם אובייקט metadata ולא File - השרת ימזג אותם בעצמו.
                const appendIfFile = (key) => {
                    const f = request.documents?.[key];
                    if (f instanceof File || f instanceof Blob) {
                        formData.append(key, f);
                    }
                };
                appendIfFile('idCard');
                appendIfFile('fatherIdCard');
                appendIfFile('motherIdCard');
                appendIfFile('studyApproval');
                appendIfFile('bankReference');

                await API.post('/api/applications/submit', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                swal('הצלחה!', 'הבקשה נשלחה בהצלחה! יישלח אליך מייל אישור בקרוב.', 'success');

                dispatch(resetCurrentApplication());
                navigate('/home');
            } catch (err) {
                console.error("Submit Error:", err);
                swal('אופס...', 'שגיאה בשמירת הנתונים בשרת. וודא שהשרת רץ והנתונים תקינים.', 'error');
            }
        } else {
            swal('פרטים חסרים או לא תקינים', 'יש למלא את כל שדות החובה, כולל אימייל תקין ופרטי אחים מלאים.', 'warning');
        }
    };

    return (
        <div className="last-form-container" style={{ direction: 'rtl', textAlign: 'center', padding: '40px' }}>
            <h1>אישור ושליחת בקשה</h1>
            <p style={{ fontSize: '18px' }}>אני מאשר/ת שכל הפרטים שנמסרו נכונים ומדויקים.</p>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>כתובת אימייל לעדכוני סטטוס:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    style={{
                        padding: '10px',
                        width: '250px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        textAlign: 'left',
                        direction: 'ltr'
                    }}
                    required
                />
            </div>

            <div className="button-group" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                <button
                    onClick={finish}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    אשר ושלח בקשה סופית
                </button>

                <button
                    onClick={() => navigate('/home')}
                    style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    ביטול
                </button>
            </div>
        </div>
    );
};
