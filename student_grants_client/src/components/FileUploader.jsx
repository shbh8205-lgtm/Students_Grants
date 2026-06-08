// עזר לחילוץ שם הקובץ מתוך הערכים האפשריים שיכולים להיות ב-Redux:
// File חדש שנבחר זה עתה, אובייקט metadata ששוחזר מטיוטה, או נתיב כסטרינג.
export const getFileName = (doc) => {
    if (!doc) return '';
    if (typeof doc === 'string') return doc.split(/[\\/]/).pop();
    return (
        doc.originalName ||
        doc.name ||
        (doc.path && doc.path.split(/[\\/]/).pop()) ||
        ''
    );
};

export const FileUploader = ({
    label,
    onFileSelect,
    fileName,
    accept = '.pdf,.jpg,.jpeg,.png',
    required = false,
}) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const hasFile = Boolean(fileName);

    return (
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
            {label && (
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                    {label}
                </label>
            )}

            <label
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: '#fafafa',
                    direction: 'rtl',
                }}
            >
                <span
                    style={{
                        background: '#e9ecef',
                        padding: '6px 14px',
                        borderRadius: '3px',
                        whiteSpace: 'nowrap',
                        fontSize: '13px',
                    }}
                >
                    {hasFile ? 'החלף קובץ' : 'בחר קובץ'}
                </span>
                <span
                    style={{
                        fontSize: '13px',
                        color: hasFile ? '#28a745' : '#777',
                        maxWidth: '260px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={fileName || ''}
                >
                    {hasFile ? fileName : 'לא נבחר קובץ'}
                </span>

                <input
                    type="file"
                    accept={accept}
                    required={required && !hasFile}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </label>
        </div>
    );
};
