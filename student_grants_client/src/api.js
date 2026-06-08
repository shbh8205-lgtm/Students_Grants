import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true // מאפשר שליחה וקבלה של עוגיות 
});

// מיירט עבור בקשות יוצאות
API.interceptors.request.use(
    (config) => {
        // שליפת הטוקן מ-localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// מיירט לטיפול בתגובות - אם הטוקן פג תוקף
API.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // הטוקן פג תוקף - נקה את localStorage והנתב לlogIn
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;