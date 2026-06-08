import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { saveStepData } from "../redux/requestSlice";
import { setCurrent } from "../redux/userSlice";
import API from "../api";
import swal from "sweetalert";

export const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        const idNumber = document.getElementById("ID_INPUT")?.value;
        const password = document.getElementById("PW")?.value;

        if (!idNumber || !password) {
            return swal("שגיאה", "יש להזין ת.ז וסיסמה", "warning");
        }

        try {
            const response = await API.post('/api/users/login', { idNumber, password });
            const { user, token } = response.data;

            // שמירת הטוקן ב-LocalStorage - האינטרסטור ב-API.js יטפל בהעברה בכל בקשה
            localStorage.setItem('token', token);

            dispatch(setCurrent({ ...user, token }));

            try {
                const draftRes = await API.get('/api/applications/my-draft');
                if (draftRes.data) {
                    const mappedDraft = {
                        selfDetails: {
                            id: draftRes.data.personalInfo?.idNumber || user.idNumber,
                            firstname: user.firstName,
                            lastname: user.lastName,
                            phone: draftRes.data.personalInfo?.mobilePhone || '',
                            homePhone: draftRes.data.personalInfo?.homePhone || '',
                            birthDate: draftRes.data.personalInfo?.birthDate || '',
                            city: draftRes.data.personalInfo?.city || '',
                            address: draftRes.data.personalInfo?.address || '',
                            zipcode: draftRes.data.personalInfo?.zipCode || ''
                        },
                        familyDetails: {
                            fatherName: draftRes.data.familyInfo?.father?.firstName || '',
                            motherName: draftRes.data.familyInfo?.mother?.firstName || '',
                            siblingsOver21Multi:
                                draftRes.data.familyInfo?.siblingsOver21WithMultipleChildren ?? '',
                            siblings: draftRes.data.familyInfo?.siblingsList || []
                        },
                        bankDetails: {
                            accountOwnerId: draftRes.data.bankInfo?.accountOwnerId || '',
                            bankName: draftRes.data.bankInfo?.bankName || '',
                            branchNumber: draftRes.data.bankInfo?.branchNumber || '',
                            accountNumber: draftRes.data.bankInfo?.accountNumber || ''
                        },
                        studies: {
                            major: draftRes.data.studyInfo?.major || '',
                            institution: draftRes.data.studyInfo?.institution || '',
                            yearsOfStudy: draftRes.data.studyInfo?.yearsOfStudy || '',
                            annualTuition: draftRes.data.studyInfo?.annualTuition || ''
                        },
                        documents: draftRes.data.documents || {}
                    };
                    dispatch(saveStepData({ step: 'all', data: mappedDraft }));
                }
            } catch (draftErr) {
                console.log("לא נמצאה טיוטה, מתחילים טופס חדש");
            }

            swal("ברוך הבא", `שלום ${user.firstName}`, "success");
            navigate('/home');

        } catch (err) {
            swal("שגיאה", err.response?.data?.message || "פרטי זיהוי לא נכונים הנך מעבר להרשמה", "error");
            navigate('/SignUp');
        }
    };

    return (
        <div className="login-page-container">
            <div className="auth-card">
                <h1 className="auth-title">כניסה למערכת</h1>
                <p className="auth-subtitle">הזינו את פרטי הזיהוי שלכם להמשך גישה למערכת המלגות.</p>

                <div className="auth-form">
                    <div className="input-group">
                        <input id="ID_INPUT" type="text" placeholder="תעודת זהות" className="main-input" />
                    </div>

                    <div className="input-group">
                        <input id="PW" type="password" placeholder="סיסמה" className="main-input" />
                    </div>

                    <button className="btn-submit" onClick={handleLogin}>כניסה למערכת</button>

                    <div className="auth-divider">
                        <span>או</span>
                    </div>

                    <button className="btn-link" onClick={() => navigate('/SignUp')}>
                        עדיין אין לך חשבון? <strong>צור חשבון עכשיו</strong>
                    </button>
                </div>
            </div>
        </div>
    );
};
