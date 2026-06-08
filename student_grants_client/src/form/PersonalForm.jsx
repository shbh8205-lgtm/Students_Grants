import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { saveStepData, addFile } from '../redux/requestSlice';
import GooglePlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';
import { FileUploader, getFileName } from '../components/FileUploader';

export const PersonalForm = ({ onEnter, ...props }) => {
    const dispatch = useDispatch();

    const requestData = useSelector(state => state.request);
    const cu = useSelector(state => state.user.current || {});

    const [personalDetails, setPersonalDetails] = useState({
        id: cu.idNumber || '',
        firstname: cu.firstName || '',
        lastname: cu.lastName || '',
        phone: requestData.selfDetails?.phone || '',
        homePhone: requestData.selfDetails?.homePhone || '',
        birthDate: requestData.selfDetails?.birthDate || '',
        city: requestData.selfDetails?.city || '',
        address: requestData.selfDetails?.address || '',
        zipcode: requestData.selfDetails?.zipcode || ''
    });

    const [errors, setErrors] = useState({});
    const isFirstRender = useRef(true);
    const hasSyncedFromRedux = useRef(false);

    // סנכרון חד-פעמי: כאשר Redux משתנה לערכים בעלי content (טעינת הטיוטה מהשרת)
    useEffect(() => {
        if (!hasSyncedFromRedux.current && Object.keys(requestData.selfDetails || {}).length > 0) {
            hasSyncedFromRedux.current = true;
            setPersonalDetails({
                id: cu.idNumber || '',
                firstname: cu.firstName || '',
                lastname: cu.lastName || '',
                phone: requestData.selfDetails?.phone || '',
                homePhone: requestData.selfDetails?.homePhone || '',
                birthDate: requestData.selfDetails?.birthDate || '',
                city: requestData.selfDetails?.city || '',
                address: requestData.selfDetails?.address || '',
                zipcode: requestData.selfDetails?.zipcode || ''
            });
        }
    }, [requestData.selfDetails, cu]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        dispatch(saveStepData({ step: 'selfDetails', data: personalDetails }));
    }, [personalDetails, dispatch]);

    const checkPhone = (value) => {
        const regex = /^(0(2|3|4|7|8|9)\d{7}|05[0-9]\d{7})$/;
        if (value !== '' && !regex.test(value)) {
            setErrors(prev => ({ ...prev, phone: 'מספר טלפון לא תקין!' }));
        } else {
            setErrors(prev => ({ ...prev, phone: '' }));
            setPersonalDetails(prev => ({ ...prev, phone: value }));
        }
    };

    const checkHomePhone = (value) => {
        const regex = /^0(2|3|4|8|9)\d{7}$/;
        if (value !== '' && !regex.test(value)) {
            setErrors(prev => ({ ...prev, homePhone: 'מספר טלפון נייח לא תקין!' }));
        } else {
            setErrors(prev => ({ ...prev, homePhone: '' }));
            setPersonalDetails(prev => ({ ...prev, homePhone: value }));
        }
    };

    const checkCity = (value) => {
        const regex = /^[a-zA-Z֐-׿\s'-]{2,}$/;
        if (value !== '' && !regex.test(value)) {
            setErrors(prev => ({ ...prev, city: 'שם עיר לא תקין' }));
        } else {
            setErrors(prev => ({ ...prev, city: '' }));
            setPersonalDetails(prev => ({ ...prev, city: value }));
        }
    };

    // חילוץ שם העיר מתוך address_components של Google.
    // locality הוא סוג העיר הסטנדרטי; אם לא נמצא נופלים על administrative_area_level_2 (מועצה אזורית).
    const extractCity = (components = []) => {
        const locality = components.find(c => c.types?.includes('locality'));
        if (locality) return locality.long_name;
        const adminL2 = components.find(c => c.types?.includes('administrative_area_level_2'));
        return adminL2?.long_name || '';
    };

    const extractZip = (components = []) => {
        const zip = components.find(c => c.types?.includes('postal_code'));
        return zip?.long_name || '';
    };

    const handlePlaceSelected = async (selectedOption) => {
        if (!selectedOption) {
            setPersonalDetails(prev => ({ ...prev, address: '' }));
            return;
        }
        const fullAddress = selectedOption.label;
        setPersonalDetails(prev => ({ ...prev, address: fullAddress }));

        try {
            const placeId = selectedOption.value?.place_id;
            if (!placeId) return;
            const results = await geocodeByPlaceId(placeId);
            const components = results?.[0]?.address_components || [];

            const city = extractCity(components);
            const zip = extractZip(components);

            setPersonalDetails(prev => ({
                ...prev,
                ...(city ? { city } : {}),
                ...(zip ? { zipcode: zip } : {}),
            }));
            if (city) setErrors(prev => ({ ...prev, city: '' }));
            if (zip) setErrors(prev => ({ ...prev, zipcode: '' }));
        } catch (err) {
            console.error('place details lookup failed:', err);
        }
    };

    const checkZipcode = (value) => {
        const regex = /\d{7}/;
        if (value !== '' && !regex.test(value)) {
            setErrors(prev => ({ ...prev, zipcode: 'מיקוד לא תקין!' }));
        } else {
            setErrors(prev => ({ ...prev, zipcode: '' }));
            setPersonalDetails(prev => ({ ...prev, zipcode: value }));
        }
    };

    if (!cu.idNumber) {
        return <div style={{ direction: 'rtl', padding: '20px' }}>טוען נתוני משתמש...</div>;
    }

    return (
        <>
            <h2>פרטים אישיים</h2>
            <form onKeyDown={onEnter} onSubmit={(e) => e.preventDefault()}>
                <div className="section" style={{ direction: 'rtl' }}>
                    <div className="section-body">
                        <label>מספר זהות:</label><br />
                        <input value={cu.idNumber} readOnly style={{ backgroundColor: '#f0f0f0' }} /><br />

                        <label>שם פרטי:</label><br />
                        <input value={cu.firstName} readOnly style={{ backgroundColor: '#f0f0f0' }} /><br />

                        <label>שם משפחה:</label><br />
                        <input value={cu.lastName} readOnly style={{ backgroundColor: '#f0f0f0' }} /><br />

                        <label>מספר טלפון נייד:</label><br />
                        <input
                            placeholder="מספר טלפון נייד"
                            value={personalDetails.phone}
                            onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                            onBlur={(e) => checkPhone(e.target.value)}
                        /><br />
                        <p style={{ color: 'red' }}>{errors.phone}</p>

                        <label>טלפון נייח (אופציונלי):</label><br />
                        <input
                            placeholder="לדוגמא 031234567"
                            value={personalDetails.homePhone}
                            onChange={(e) => setPersonalDetails({ ...personalDetails, homePhone: e.target.value })}
                            onBlur={(e) => checkHomePhone(e.target.value)}
                        /><br />
                        <p style={{ color: 'red' }}>{errors.homePhone}</p>

                        <label>תאריך לידה:</label><br />
                        <input
                            type="date"
                            value={personalDetails.birthDate}
                            onChange={(e) => {
                                if (new Date(e.target.value) < new Date()) {
                                    setPersonalDetails({ ...personalDetails, birthDate: e.target.value });
                                }
                            }}
                        /><br />
                        <p style={{ color: 'red' }}>{errors.birthDate}</p>

                        <FileUploader
                            label='צילום ת"ז + ספח:'
                            accept="image/*,.pdf"
                            fileName={getFileName(requestData.documents?.idCard)}
                            onFileSelect={(file) => dispatch(addFile({ fileName: 'idCard', file }))}
                        />

                        <label>כתובת:</label><br />
                        <GooglePlacesAutocomplete
                            apiKey={process.env.REACT_APP_GOOGLE_PLACES_API_KEY}
                            selectProps={{
                                value: personalDetails.address ? { label: personalDetails.address, value: personalDetails.address } : null,
                                onChange: handlePlaceSelected,
                                placeholder: 'התחל להקליד כתובת...',
                                isClearable: true,
                                rtl: true,
                            }}
                        />

                        {personalDetails.address && (
                            <p style={{ marginTop: '10px' }}>
                                נבחרה הכתובת: <strong>{personalDetails.address}</strong>
                            </p>
                        )}
                        <br />

                        <label>עיר מגורים:</label><br />
                        <input
                            placeholder="העיר תזוהה אוטומטית לאחר בחירת כתובת"
                            value={personalDetails.city}
                            onChange={(e) => setPersonalDetails({ ...personalDetails, city: e.target.value })}
                            onBlur={(e) => checkCity(e.target.value)}
                        /><br />
                        <p style={{ color: 'red' }}>{errors.city}</p>
                        <br />
                        <label htmlFor="zipcode">מיקוד:</label><br />
                        <input
                            type="text"
                            id="zipcode"
                            name="zipcode"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            value={personalDetails.zipcode}
                            onChange={(e) => setPersonalDetails({ ...personalDetails, zipcode: e.target.value })}
                            onBlur={(e) => checkZipcode(e.target.value)}
                        /><br />
                        <small>
                            <a href="https://israelpost.co.il/locatezip" target="_blank" rel="noreferrer">
                                איתור מיקוד באתר דואר ישראל
                            </a>
                        </small>
                    </div>
                </div>
            </form>
        </>
    );
};
