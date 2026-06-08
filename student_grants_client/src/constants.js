// Application Statuses
export const APPLICATION_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const APPLICATION_STATUS_LABELS = {
    draft: 'טיוטה',
    pending: 'ממתין לטיפול',
    approved: 'אושר',
    rejected: 'נדחה'
};

// User Roles
export const USER_ROLE = {
    STUDENT: 'student',
    ADMIN: 'admin'
};

// File Types (for upload validation)
export const ALLOWED_FILE_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/jpg'],
    PDF: ['application/pdf'],
    DOCUMENT: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
};

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Validation Regex
export const REGEX = {
    PHONE_IL: /^(0(2|3|4|7|8|9)\d{7}|05[0-9]\d{7})$/,
    ZIPCODE: /^\d{7}$/,
    ADDRESS: /^[a-zA-Z0-9\u0590-\u05FF\s,.'-]{5,}$/,
    ID_NUMBER: /^\d{9}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// API Endpoints
export const API_ENDPOINTS = {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    LOGOUT: '/api/users/logout',
    CHECK_AUTH: '/api/users/check-auth',
    SUBMIT_APPLICATION: '/api/applications/submit',
    GET_MY_STATUS: '/api/applications/my-status',
    GET_MY_DRAFT: '/api/applications/my-draft',
    GET_ALL_REQUESTS: '/api/applications/requests',
    UPDATE_REQUEST_STATUS: (id) => `/api/applications/${id}`
};

// Error Messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'אין הרשאה לביצוע פעולה זו',
    NOT_FOUND: 'המשתמש או הבקשה לא נמצאים',
    SERVER_ERROR: 'שגיאה בשרת, אנא נסה שוב מאוחר יותר',
    INVALID_DATA: 'הנתונים שהוזנו אינם תקינים',
    TOKEN_EXPIRED: 'הטוקן פג תוקף, אנא התחבר מחדש',
    INVALID_CREDENTIALS: 'ת.ז או סיסמה אינם נכונים'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'התחברת בהצלחה',
    REGISTER_SUCCESS: 'ההרשמה בוצעה בהצלחה',
    APPLICATION_SAVED: 'הטיוטה נשמרה בהצלחה',
    APPLICATION_SUBMITTED: 'הבקשה הוגשה בהצלחה',
    STATUS_UPDATED: 'הסטטוס עודכן בהצלחה'
};
