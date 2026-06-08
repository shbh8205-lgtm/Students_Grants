import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { saveStepData, addFile } from '../redux/requestSlice';
import { FileUploader, getFileName } from '../components/FileUploader';

export const FamilyForm = ({ onEnter, ...props }) => {
    const dispatch = useDispatch();

    const requestState = useSelector(state => state.request) || {};

    const [familyDetails, setFamilyDetails] = useState({
        fatherName: requestState.familyDetails?.fatherName || '',
        motherName: requestState.familyDetails?.motherName || '',
        siblingsOver21Multi: requestState.familyDetails?.siblingsOver21Multi ?? '',
        siblings: requestState.familyDetails?.siblings || []
    });

    const [errors, setErrors] = useState({
        fn: '',
        mn: '',
        childernCount: '',
        bigChildernCount: '',
        siblingsErrors: []
    });
    const isFirstRender = useRef(true);
    const hasSyncedFromRedux = useRef(false);

    useEffect(() => {
        if (!hasSyncedFromRedux.current && Object.keys(requestState.familyDetails || {}).length > 0) {
            hasSyncedFromRedux.current = true;
            setFamilyDetails({
                fatherName: requestState.familyDetails?.fatherName || '',
                motherName: requestState.familyDetails?.motherName || '',
                siblingsOver21Multi: requestState.familyDetails?.siblingsOver21Multi ?? '',
                siblings: requestState.familyDetails?.siblings || []
            });
        }
    }, [requestState.familyDetails]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        dispatch(saveStepData({ step: 'familyDetails', data: familyDetails }));
    }, [familyDetails, dispatch]);

    const fnRegex = /^([א-ת]+(?:\s[א-ת]+)*|[a-zA-Z]+(?:\s[a-zA-Z]+)*)$/;
    const numRegex = /^(25|[1-9]?[0-9])$/;

    const updateField = (field, value) => {
        setFamilyDetails(prev => ({ ...prev, [field]: value }));
    };

    const validateField = (field, value, regex, errorMsg, errorKey) => {
        if (value && !regex.test(value)) {
            setErrors(prev => ({ ...prev, [errorKey]: errorMsg }));
        } else {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const validateSiblingField = (index, field, value, regex, errorMsg) => {
        setErrors(prev => {
            const newSiblingsErrors = [...prev.siblingsErrors];
            if (!newSiblingsErrors[index]) {
                newSiblingsErrors[index] = {};
            }
            if (value && !regex.test(value)) {
                newSiblingsErrors[index][field] = errorMsg;
            } else {
                newSiblingsErrors[index][field] = '';
            }
            return { ...prev, siblingsErrors: newSiblingsErrors };
        });
    };

    const addSibling = () => {
        const newSibling = { idNumber: '', lastName: '', firstName: '', birthDate: '' };
        setFamilyDetails(prev => ({
            ...prev,
            siblings: [...prev.siblings, newSibling]
        }));
    };

    const updateSiblingField = (index, field, value) => {
        const updatedSiblings = [...familyDetails.siblings];
        updatedSiblings[index] = { ...updatedSiblings[index], [field]: value };
        setFamilyDetails(prev => ({ ...prev, siblings: updatedSiblings }));
    };

    const removeSibling = (index) => {
        const updatedSiblings = familyDetails.siblings.filter((_, i) => i !== index);
        setFamilyDetails(prev => ({ ...prev, siblings: updatedSiblings }));
    };

    return (
        <>
            <h2>פרטי משפחה</h2>
            <form onKeyDown={onEnter} onSubmit={(e) => e.preventDefault()}>

                <input
                    value={familyDetails.fatherName}
                    onChange={(e) => updateField('fatherName', e.target.value)}
                    onBlur={(e) => validateField('fatherName', e.target.value, fnRegex, 'שם לא תקין', 'fn')}
                    placeholder="שם האב"
                />
                <p style={{ color: 'red', fontSize: '12px' }}>{errors.fn}</p>

                <input
                    value={familyDetails.motherName}
                    onChange={(e) => updateField('motherName', e.target.value)}
                    onBlur={(e) => validateField('motherName', e.target.value, fnRegex, 'שם לא תקין', 'mn')}
                    placeholder="שם האם"
                />
                <p style={{ color: 'red', fontSize: '12px' }}>{errors.mn}</p>

                <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>
                        מספר אחים מעל גיל 21 שיש להם יותר מילד אחד:
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="25"
                        value={familyDetails.siblingsOver21Multi}
                        onChange={(e) => updateField('siblingsOver21Multi', e.target.value)}
                        onBlur={(e) => validateField('siblingsOver21Multi', e.target.value, numRegex, 'מספר לא תקין', 'bigChildernCount')}
                        placeholder="0"
                    />
                    <p style={{ color: 'red', fontSize: '12px' }}>{errors.bigChildernCount}</p>
                </div>

                <div className="file-upload-section" style={{ marginTop: '15px', border: '1px solid #eee', padding: '10px' }}>
                    <FileUploader
                        label='צילום ת"ז + ספח אב:'
                        accept="image/*,.pdf"
                        fileName={getFileName(requestState.documents?.fatherIdCard)}
                        onFileSelect={(file) => dispatch(addFile({ fileName: 'fatherIdCard', file }))}
                    />

                    <FileUploader
                        label='צילום ת"ז + ספח אם:'
                        accept="image/*,.pdf"
                        fileName={getFileName(requestState.documents?.motherIdCard)}
                        onFileSelect={(file) => dispatch(addFile({ fileName: 'motherIdCard', file }))}
                    />
                </div>

                <div className="siblings-section">
                    <h3>פרטי אחים</h3>
                    {familyDetails.siblings.map((sibling, index) => (
                        <div key={index} className="sibling-card">
                            <input
                                placeholder="מספר זהות"
                                value={sibling.idNumber}
                                onChange={(e) => updateSiblingField(index, 'idNumber', e.target.value)}
                                onBlur={(e) => validateSiblingField(index, 'idNumber', e.target.value, /^\d{9}$/, 'ת.ז חייבת להכיל 9 ספרות')}
                            />
                            {errors.siblingsErrors[index]?.idNumber && (
                                <p style={{ color: 'red', fontSize: '11px' }}>{errors.siblingsErrors[index].idNumber}</p>
                            )}

                            <input
                                placeholder="שם פרטי"
                                value={sibling.firstName}
                                onChange={(e) => updateSiblingField(index, 'firstName', e.target.value)}
                                onBlur={(e) => validateSiblingField(index, 'firstName', e.target.value, fnRegex, 'שם לא תקין')}
                            />
                            {errors.siblingsErrors[index]?.firstName && (
                                <p style={{ color: 'red', fontSize: '11px' }}>{errors.siblingsErrors[index].firstName}</p>
                            )}

                            <input
                                placeholder="שם משפחה"
                                value={sibling.lastName}
                                onChange={(e) => updateSiblingField(index, 'lastName', e.target.value)}
                                onBlur={(e) => validateSiblingField(index, 'lastName', e.target.value, fnRegex, 'שם לא תקין')}
                            />
                            {errors.siblingsErrors[index]?.lastName && (
                                <p style={{ color: 'red', fontSize: '11px' }}>{errors.siblingsErrors[index].lastName}</p>
                            )}

                            <input
                                placeholder="תאריך לידה"
                                type="date"
                                value={sibling.birthDate}
                                onChange={(e) => {
                                    if (new Date(e.target.value) < new Date()) {
                                        updateSiblingField(index, 'birthDate', e.target.value);
                                    }
                                }}
                            />

                            <button type="button" onClick={() => removeSibling(index)}>מחק אח</button>
                        </div>
                    ))}

                    <button type="button" onClick={addSibling} style={{ marginTop: '10px' }}>
                        + הוסף אח
                    </button>
                </div>
            </form>
        </>
    );
};
