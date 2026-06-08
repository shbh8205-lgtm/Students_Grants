import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. ייבוא ה-Provider וה-Store (הקפידי על נתיב נכון ל-store שלך)
import { Provider } from 'react-redux';
import s from './redux/store'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. עטיפת App ב-Provider */}
    <Provider store={s}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();