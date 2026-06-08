import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api";
import swal from "sweetalert";
import { saveStepData, resetCurrentApplication } from "../redux/requestSlice";

export const MainForm = (props) => {
    let steps = React.Children.toArray(props.children);
    const [num, setNum] = useState(0);

    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.user.current);

    useEffect(() => {
        const fetchDraft = async () => {
            if (!currentUser || !currentUser.idNumber) {
                dispatch(resetCurrentApplication());
                return;
            }

            try {
                const response = await API.get('/api/applications/my-draft');
                if (response.data) {
                    const mappedDraft = {
                        selfDetails: {
                            id: response.data.personalInfo?.idNumber || currentUser?.idNumber,
                            firstname: currentUser?.firstName || '',
                            lastname: currentUser?.lastName || '',
                            phone: response.data.personalInfo?.mobilePhone || '',
                            homePhone: response.data.personalInfo?.homePhone || '',
                            birthDate: response.data.personalInfo?.birthDate || '',
                            city: response.data.personalInfo?.city || '',
                            address: response.data.personalInfo?.address || '',
                            zipcode: response.data.personalInfo?.zipCode || ''
                        },
                        familyDetails: {
                            fatherName: response.data.familyInfo?.father?.firstName || '',
                            motherName: response.data.familyInfo?.mother?.firstName || '',
                            siblingsOver21Multi:
                                response.data.familyInfo?.siblingsOver21WithMultipleChildren ?? '',
                            siblings: response.data.familyInfo?.siblingsList || []
                        },
                        bankDetails: {
                            firstname: response.data.bankInfo?.accountOwnerId || '',
                            id: response.data.bankInfo?.accountOwnerId || '',
                            numSnif: response.data.bankInfo?.branchNumber || '',
                            num: response.data.bankInfo?.accountNumber || '',
                            bank: response.data.bankInfo?.bankName || ''
                        },
                        studies: {
                            Trend: response.data.studyInfo?.major || '',
                            institution: response.data.studyInfo?.institution || '',
                            num: response.data.studyInfo?.yearsOfStudy || '',
                            Price: response.data.studyInfo?.annualTuition || ''
                        },
                        documents: response.data.documents || {}
                    };
                    dispatch(saveStepData({ step: 'all', data: mappedDraft }));
                }
            } catch (err) {
                console.log("No draft found or error fetching");
                dispatch(resetCurrentApplication());
            }
        };
        fetchDraft();
    }, [dispatch, currentUser]);

    const currentApplication = useSelector(state => state.request);

    const next = () => {
        if (num < steps.length - 1) setNum(num + 1);
    };

    const prev = () => {
        if (num > 0) setNum(num - 1);
    };

    // פונקציה מרכזית לשמירת טיוטה - תעבוד מכל שלב.
    const handleSaveDraft = async () => {
        try {
            const formData = new FormData();

            const applicationPayload = {
                personalInfo: {
                    idNumber: currentApplication.selfDetails?.id,
                    mobilePhone: currentApplication.selfDetails?.phone,
                    homePhone: currentApplication.selfDetails?.homePhone,
                    birthDate: currentApplication.selfDetails?.birthDate,
                    city: currentApplication.selfDetails?.city,
                    address: currentApplication.selfDetails?.address,
                    zipCode: currentApplication.selfDetails?.zipcode
                },
                familyInfo: {
                    father: { firstName: currentApplication.familyDetails?.fatherName },
                    mother: { firstName: currentApplication.familyDetails?.motherName },
                    siblingsOver21WithMultipleChildren:
                        Number(currentApplication.familyDetails?.siblingsOver21Multi) || 0,
                    siblingsList: currentApplication.familyDetails?.siblings || []
                },
                bankInfo: {
                    accountOwnerId: currentApplication.bankDetails?.id,
                    bankName: currentApplication.bankDetails?.bank,
                    branchNumber: currentApplication.bankDetails?.numSnif,
                    accountNumber: currentApplication.bankDetails?.num
                },
                studyInfo: {
                    major: currentApplication.studies?.Trend,
                    institution: currentApplication.studies?.institution,
                    yearsOfStudy: currentApplication.studies?.num,
                    annualTuition: currentApplication.studies?.Price
                },
                documents: currentApplication.documents || {},
                isDraft: true
            };

            formData.append('applicationData', JSON.stringify(applicationPayload));

            // קבצים שכבר נשמרו בעבר הם metadata ולא File - השרת ישמר אותם כפי שהם.
            const appendIfFile = (key) => {
                const f = currentApplication.documents?.[key];
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

            swal('נשמר!', 'הטיוטה שלך נשמרה בהצלחה.', 'success');
        } catch (err) {
            console.error("Save draft error:", err);
            const errorMessage = err.response?.data?.message || 'לא ניתן היה לשמור את הטיוטה.';
            swal('שגיאה', errorMessage, 'error');
        }
    };

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            next();
        }
    };

    return <>
        <div className="stepper-wrapper">
            <div className="stepper-container">
                {steps.map((x, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && <div className={`step-connector ${num >= i ? 'completed' : ''}`}></div>}

                        <div className="step-item">
                            <button
                                className={`step-button ${num === i ? 'active' : ''} ${num > i ? 'completed' : ''}`}
                                onClick={() => setNum(i)}
                            >
                                {num > i ? '✓' : i + 1}
                            </button>
                            <div className="step-label">שלב {i + 1}</div>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="form-content-card">
                <div className="step-fields-container">
                    {React.cloneElement(steps[num], { onEnter: handleEnter })}
                </div>

                <div className="form-navigation-inner">
                    <button className="btn-secondary" onClick={prev} disabled={num === 0}>הקודם</button>

                    <button className="btn-draft" onClick={handleSaveDraft}>שמור טיוטה</button>

                    <button className="btn-primary" onClick={next} disabled={num === steps.length - 1}>
                        {num === steps.length - 1 ? 'שלח בקשה' : 'הבא'}
                    </button>
                </div>
            </div>
        </div>
    </>;
};
