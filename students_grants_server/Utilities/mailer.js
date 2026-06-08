import nodemailer from 'nodemailer';

const sendStatusEmail = async (to, status, appId, isFirstEmail = false) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // שימוש ב-service מקצר הגדרות
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const statusLink = `${process.env.FRONTEND_URL}/application-status/${appId}`;
        const subject = isFirstEmail ? 'אישור קבלת בקשה במערכת' : `עדכון סטטוס בקשה: ${status}`;
        const greeting = isFirstEmail ? 'שמחנו לקבל את פנייתך!' : 'אנחנו מעדכנים שחל שינוי בסטטוס הבקשה שלך.';
        const bodyText = isFirstEmail
            ? 'הבקשה נקלטה בהצלחה ותועבר לטיפול המנהלים.'
            : `סטטוס הבקשה שלך עודכן ל: <strong style="color: #27ae60;">${status}</strong>.`;

        const mailOptions = {
            from: `"אין להשיב - מערכת ניהול" <${process.env.EMAIL_USER}>`,
            to: to,
            replyTo: 'noreply@grants.com', // הכתובת אליה ינסו להשיב
            subject: subject,
            html: `
                <div style="direction: rtl; font-family: sans-serif; text-align: right; padding: 20px; border: 1px solid #eee;">
                    <h2>${subject}</h2>
                    <p>שלום רב, ${greeting}</p>
                    <p>${bodyText}</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${statusLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">לצפייה בסטטוס</a>
                    </div>
                    <hr />
                    <p style="font-size: 12px; color: #777; text-align: center;">זוהי הודעה אוטומטית, נא לא להשיב למייל זה.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent!");
        return info;
    } catch (error) {
        console.error('Mailer Error:', error);
        throw error;
    }
};

export default sendStatusEmail;