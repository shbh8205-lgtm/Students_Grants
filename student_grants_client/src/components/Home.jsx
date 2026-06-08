import { useNavigate } from "react-router";

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-split">
                    <div className="hero-content">
                        <span className="hero-eyebrow">מערכת מלגות לסטודנטים</span>
                        <h1>הגשת בקשות לסיוע במימון לימודים</h1>
                        <p>פלטפורמה רשמית להגשה מקוונת, מעקב שקוף וניהול בקשות תמיכה אקדמית.</p>
                        <button className="cta-button-main" onClick={() => navigate('/form')}>
                            לפתיחת בקשה
                        </button>
                    </div>
                    <div className="hero-emblem" aria-hidden="true">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img">
                            <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="0.75" />
                            <path
                                d="M55 110 Q40 95 48 70 Q60 78 66 92 Q70 102 70 112"
                                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                            />
                            <path
                                d="M58 100 Q52 92 58 82 M65 110 Q60 102 64 94 M72 118 Q68 112 70 104"
                                fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                            />
                            <path
                                d="M145 110 Q160 95 152 70 Q140 78 134 92 Q130 102 130 112"
                                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                            />
                            <path
                                d="M142 100 Q148 92 142 82 M135 110 Q140 102 136 94 M128 118 Q132 112 130 104"
                                fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                            />
                            <path d="M70 80 L100 65 L130 80 L100 95 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M75 82 L75 100 Q100 112 125 100 L125 82" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            <line x1="100" y1="95" x2="100" y2="108" stroke="currentColor" strokeWidth="1" />
                            <circle cx="100" cy="112" r="2.5" fill="currentColor" />
                            <path d="M70 135 Q100 145 130 135" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                            <text x="100" y="158" textAnchor="middle" fontSize="9" fill="currentColor" letterSpacing="2" fontFamily="serif">SCHOLA</text>
                        </svg>
                    </div>
                </div>
            </header>

            {/* Promotions Section */}
            <main className="info-container"><br />
                <h2 className="section-title">עדכונים והזדמנויות</h2>
                <div className="promotions-grid">
                    <div className="promo-card">קורסים בהנחה למבקשי מלגה</div>
                    <div className="promo-card highlight">מענקים מיוחדים למגישים היום</div>
                    <div className="promo-card">הנחה על ספרים וציוד</div>
                    <div className="promo-card">סדנאות חינם לכתיבת קורות חיים</div>
                    <div className="promo-card">תוכניות מלגות חדשות 2024</div>
                    <div className="promo-card">פלטפורמות למידה מקוונות</div>
                </div>
            </main>
        </div>
    );
};
