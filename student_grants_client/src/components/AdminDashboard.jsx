import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import API from "../api";

export default function AdminDashboard() {
    const nav = useNavigate();

    const currentUser = useSelector(state => state.user.current);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State לסינונים - כל הסינון והמיון מתבצעים בצד השרת
    const [filters, setFilters] = useState({
        idNumber: "",
        fromDate: "",
        toDate: "",
        sortByDate: "",
        minSiblings: "",
        maxSiblings: "",
        sortByChildren: "",
        city: "",
        minTuition: "",
        maxTuition: "",
        sortByTuition: ""
    });

    const isAdmin = currentUser?.role === "admin";

    const fetchRequests = useCallback(async () => {
        if (!isAdmin) return;

        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const response = await API.get(`/api/applications/admin/all?${params.toString()}`, {
                headers: { 'user-id': currentUser.idNumber }
            });
            // השרת מחזיר רק בקשות שאינן מאושרות
            setRequests(response.data);
            setError(null);
        } catch (err) {
            setError("שגיאה בטעינת הנתונים מהשרת");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, isAdmin, currentUser?.idNumber]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    if (!isAdmin) {
        return <div style={{ textAlign: 'center', color: 'red' }}><h1>גישה חסומה</h1></div>;
    }

    return (
        <div style={{ direction: "rtl", padding: "20px" }}>
            <h2>לוח בקשות - ניהול מערכת</h2>

            {/* ממשק סינון מהיר - כל סינון/מיון מתבצע בצד השרת */}
            <section style={filterStyles}>
                <input
                    placeholder="חפש תעודת זהות..."
                    onBlur={(e) => setFilters(prev => ({ ...prev, idNumber: e.target.value }))}
                />

                <input
                    placeholder="עיר מגורים..."
                    onBlur={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                />

                <label style={{ fontSize: '12px' }}>מתאריך:
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                    />
                </label>
                <label style={{ fontSize: '12px' }}>עד תאריך:
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                    />
                </label>
                <select
                    value={filters.sortByDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortByDate: e.target.value }))}
                >
                    <option value="">מיון לפי תאריך</option>
                    <option value="asc">מהישן לחדש</option>
                    <option value="desc">מהחדש לישן</option>
                </select>

                <input
                    type="number"
                    placeholder="מינימום אחים מתחת ל-18"
                    value={filters.minSiblings}
                    onChange={(e) => setFilters(prev => ({ ...prev, minSiblings: e.target.value }))}
                />
                <input
                    type="number"
                    placeholder="מקסימום אחים מתחת ל-18"
                    value={filters.maxSiblings}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxSiblings: e.target.value }))}
                />
                <select
                    value={filters.sortByChildren}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortByChildren: e.target.value }))}
                >
                    <option value="">מיון לפי כמות אחים</option>
                    <option value="asc">מהנמוך לגבוה</option>
                    <option value="desc">מהגבוה לנמוך</option>
                </select>

                <input
                    type="number"
                    placeholder="שכר לימוד מינימלי"
                    value={filters.minTuition}
                    onChange={(e) => setFilters(prev => ({ ...prev, minTuition: e.target.value }))}
                />
                <input
                    type="number"
                    placeholder="שכר לימוד מקסימלי"
                    value={filters.maxTuition}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxTuition: e.target.value }))}
                />
                <select
                    value={filters.sortByTuition}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortByTuition: e.target.value }))}
                >
                    <option value="">מיון לפי שכר</option>
                    <option value="asc">מהנמוך לגבוה</option>
                    <option value="desc">מהגבוה לנמוך</option>
                </select>

                <button onClick={fetchRequests}>רענן נתונים 🔄</button>
            </section>

            {loading ? (
                <p>טוען בקשות...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : requests.length === 0 ? (
                <p>לא נמצאו בקשות הממתינות לטיפול.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#eee' }}>
                            <th>ת"ז</th>
                            <th>שם משפחה</th>
                            <th>שם פרטי</th>
                            <th>מגמה</th>
                            <th>סטטוס</th>
                            <th>פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr
                                key={req._id}
                                style={{ borderBottom: '1px solid #ccc', cursor: 'pointer' }}
                                onClick={() => nav(`/ShowRequest`, { state: { id: req._id } })}
                            >
                                <td>{req.userId?.idNumber}</td>
                                <td>{req.userId?.lastName}</td>
                                <td>{req.userId?.firstName}</td>
                                <td>{req.studyInfo?.major}</td>
                                <td>{statusLabels[req.status] || req.status}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => nav(`/ShowRequest`, { state: { id: req._id } })}>
                                        צפה בפרטים
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const filterStyles = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    flexWrap: 'wrap'
};

const statusLabels = {
    pending: 'בהמתנה',
    approved: 'אושרה',
    rejected: 'נדחתה',
    draft: 'טיוטה'
};
