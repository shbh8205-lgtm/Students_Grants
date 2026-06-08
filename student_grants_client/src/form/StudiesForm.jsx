import { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addFile, saveStepData } from '../redux/requestSlice';
import Select from 'react-select';
import { tracksList } from './tracksData';
import { FileUploader, getFileName } from '../components/FileUploader';

export const StudiesForm = ({ onEnter, ...props }) => {
    const dispatch = useDispatch();

    const requestState = useSelector(state => state.request) || {};

    const [studiesDetails, setStudiesDetails] = useState({
        institution: requestState.studies?.institution || '',
        Trend: requestState.studies?.Trend || '',
        Price: requestState.studies?.Price || '',
        num: requestState.studies?.num || ''
    });

    const [errors, setErrors] = useState({});
    const isFirstRender = useRef(true);
    const hasSyncedFromRedux = useRef(false);

    useEffect(() => {
        if (!hasSyncedFromRedux.current && Object.keys(requestState.studies || {}).length > 0) {
            hasSyncedFromRedux.current = true;
            setStudiesDetails({
                institution: requestState.studies?.institution || '',
                Trend: requestState.studies?.Trend || '',
                Price: requestState.studies?.Price || '',
                num: requestState.studies?.num || ''
            });
        }
    }, [requestState.studies]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        dispatch(saveStepData({ step: 'studies', data: studiesDetails }));
    }, [studiesDetails, dispatch]);

    const updateField = (field, value) => {
        setStudiesDetails(prev => ({ ...prev, [field]: value }));
    };

    const checkInstitution = (value) => {
        const fnRegex = /^([א-ת]+(?:\s[א-ת]+)*|[a-zA-Z]+(?:\s[a-zA-Z]+)*)$/;
        if (value && !fnRegex.test(value)) {
            setErrors(prev => ({ ...prev, institution: 'שם מוסד לא תקין' }));
        } else {
            setErrors(prev => ({ ...prev, institution: '' }));
        }
    };

    const checkPrice = (value) => {
        if (value && isNaN(value)) {
            setErrors(prev => ({ ...prev, Price: 'מחיר חייב להיות מספר' }));
        } else {
            setErrors(prev => ({ ...prev, Price: '' }));
        }
    };

    const checkNumberOfYears = (value) => {
        if (value && !/^(10|[1-9]?[0-9])$/.test(value)) {
            setErrors(prev => ({ ...prev, num: 'מספר שנים לא תקין (0-10)' }));
        } else {
            setErrors(prev => ({ ...prev, num: '' }));
        }
    };

    const options = tracksList.map(t => ({ value: t, label: t }));

    return <>
        <h2>פרטי לימודים</h2>
        <form onKeyDown={onEnter} onSubmit={(e) => e.preventDefault()}>

            <input
                value={studiesDetails.institution}
                onChange={(e) => updateField('institution', e.target.value)}
                onBlur={(e) => checkInstitution(e.target.value)}
                placeholder="שם מוסד"
            /><br />
            <p style={{ color: 'red', fontSize: '12px' }}>{errors.institution}</p>

            <Select
                options={options}
                value={options.find(opt => opt.value === studiesDetails.Trend)}
                onChange={(selectedOption) => updateField('Trend', selectedOption.value)}
                placeholder="בחר מגמה..."
                isSearchable={true}
            /><br />

            <input
                value={studiesDetails.Price}
                onChange={(e) => updateField('Price', e.target.value)}
                onBlur={(e) => checkPrice(e.target.value)}
                placeholder="מחיר לשנה"
            /><br />
            <p style={{ color: 'red', fontSize: '12px' }}>{errors.Price}</p>

            <input
                value={studiesDetails.num}
                onChange={(e) => updateField('num', e.target.value)}
                onBlur={(e) => checkNumberOfYears(e.target.value)}
                placeholder="מספר שנות לימוד"
            /><br />
            <p style={{ color: 'red', fontSize: '12px' }}>{errors.num}</p>

            <div className="file-upload-section" style={{ marginTop: '20px' }}>
                <FileUploader
                    label="העלאת אישור לימודים רשמי:"
                    accept="image/*,.pdf"
                    required
                    fileName={getFileName(requestState.documents?.studyApproval)}
                    onFileSelect={(file) => dispatch(addFile({ fileName: 'studyApproval', file }))}
                />
                {errors.studyFile && <p style={{ color: 'red' }}>{errors.studyFile}</p>}
            </div>
        </form>
    </>;
};
