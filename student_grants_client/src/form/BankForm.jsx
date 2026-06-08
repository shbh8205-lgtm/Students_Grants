import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveStepData, addFile } from '../redux/requestSlice';
import { FileUploader, getFileName } from '../components/FileUploader';

export const BankForm = ({ onEnter, ...props }) => {
    const dispatch = useDispatch();

    const requestState = useSelector(state => state.request) || {};

    const [bankDetails, setbankDetails] = useState({
        firstname: requestState.bankDetails?.firstname || '',
        id: requestState.bankDetails?.id || '',
        numSnif: requestState.bankDetails?.numSnif || '',
        num: requestState.bankDetails?.num || '',
        bank: requestState.bankDetails?.bank || ''
    });

    const [errors, setErrors] = useState({});
    const isFirstRender = useRef(true);
    const hasSyncedFromRedux = useRef(false);

    useEffect(() => {
        if (!hasSyncedFromRedux.current && Object.keys(requestState.bankDetails || {}).length > 0) {
            hasSyncedFromRedux.current = true;
            setbankDetails({
                firstname: requestState.bankDetails?.firstname || '',
                id: requestState.bankDetails?.id || '',
                numSnif: requestState.bankDetails?.numSnif || '',
                num: requestState.bankDetails?.num || '',
                bank: requestState.bankDetails?.bank || ''
            });
        }
    }, [requestState.bankDetails]);

    const banksList = [
        { name: "דיסקונט", number: 11 },
        { name: "הפועלים", number: 12 },
        { name: "לאומי", number: 10 },
        { name: "מזרחי טפחות", number: 20 },
        { name: "הבינלאומי", number: 31 }
    ];

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        dispatch(saveStepData({ step: 'bankDetails', data: bankDetails }));
    }, [bankDetails, dispatch]);

    // וולידציה לתעודת זהות (אלגוריתם 7-9)
    const validateId = (value) => {
        if (!value) return;
        if (value.length !== 9 || isNaN(value)) {
            setErrors(prev => ({ ...prev, id: 'תעודת זהות חייבת להכיל 9 ספרות' }));
            return;
        }
        let sum = 0, incNum;
        for (let i = 0; i < value.length; i++) {
            incNum = Number(value[i]) * ((i % 2) + 1);
            sum += (incNum > 9) ? incNum - 9 : incNum;
        }
        if (sum % 10 !== 0) {
            setErrors(prev => ({ ...prev, id: 'מספר זהות לא תקין' }));
        } else {
            setErrors(prev => ({ ...prev, id: '' }));
        }
    };

    const updateField = (field, value) => {
        setbankDetails(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <h2>פרטי חשבון בנק</h2>
            <form onKeyDown={onEnter} onSubmit={(e) => e.preventDefault()}>
                <br />

                <input
                    value={bankDetails.firstname}
                    onChange={(e) => updateField('firstname', e.target.value)}
                    placeholder="שם בעל החשבון"
                /><br />
                <p style={{ color: 'red' }}>{errors.fn}</p>

                <input
                    value={bankDetails.id}
                    onChange={(e) => updateField('id', e.target.value)}
                    onBlur={(e) => validateId(e.target.value)}
                    placeholder="תעודת זהות של בעל החשבון"
                /><br />
                <p style={{ color: 'red' }}>{errors.id}</p>

                <input
                    value={bankDetails.numSnif}
                    onChange={(e) => updateField('numSnif', e.target.value)}
                    placeholder="מספר סניף"
                /><br />
                <p style={{ color: 'red' }}>{errors.numSnif}</p>

                <input
                    value={bankDetails.num}
                    onChange={(e) => updateField('num', e.target.value)}
                    placeholder="מספר חשבון"
                /><br />
                <p style={{ color: 'red' }}>{errors.num}</p>

                <select
                    value={bankDetails.bank}
                    onChange={(e) => updateField('bank', e.target.value)}
                >
                    <option value="" disabled>בחר בנק</option>
                    {banksList.map(bank => (
                        <option key={bank.number} value={bank.name}>
                            {bank.name} ({bank.number})
                        </option>
                    ))}
                </select>

                <div className="file-upload-section" style={{ marginTop: '20px' }}>
                    <FileUploader
                        label="העלאת אישור ניהול חשבון / צילום צ'ק:"
                        accept="image/*,.pdf"
                        required
                        fileName={getFileName(requestState.documents?.bankReference)}
                        onFileSelect={(file) => dispatch(addFile({ fileName: 'bankReference', file }))}
                    />
                    {errors.bankFile && <p style={{ color: 'red' }}>{errors.bankFile}</p>}
                </div>
            </form>
        </>
    );
};
