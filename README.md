Student Grants 🎓

A full-stack platform for managing student scholarship (grant) applications, built with the MERN stack (MongoDB, Express, React, Node.js). Applicants fill out a multi-step form and track their status; admins review, filter, sort, and approve/reject applications, with automatic email notifications.

Table of Contents
Overview
Tech Stack
Key Features
Data Model
Project Structure
Setup & Running
Environment Variables
Overview

Student Grants streamlines the end-to-end scholarship application process: a student registers, fills out a guided multi-step form (personal details, family info, studies, bank details), uploads supporting documents, and can save a draft to continue later. An admin dashboard lets staff filter and sort all pending applications by multiple criteria, view full application details, and approve or reject each one — automatically emailing the applicant about the status change.

Tech Stack

Backend:

Node.js + Express 5
MongoDB + Mongoose
JWT authentication (via HTTP-only cookies) + bcrypt password hashing
Multer + Cloudinary — file upload & storage for supporting documents
Nodemailer — automated status-update emails

Frontend:

React 19
Redux Toolkit — global state (user session, in-progress application draft)
React Router — route guards for authenticated/admin-only pages
react-select, react-google-places-autocomplete, SweetAlert
Key Features
🔐 Authentication & Roles – Registration/login by national ID number, JWT stored in an HTTP-only cookie, and role-based access (user / admin) enforced both in route guards on the client and in middleware on the server.
📝 Multi-Step Application Form – A guided flow across dedicated steps (PersonalForm, FamilyForm, StudiesForm, BankForm, VerifyForm), all synced to a Redux slice so progress isn't lost between steps.
💾 Draft Saving – Applicants can save an incomplete application as a draft and resume it later; submitting later reuses the same document instead of creating duplicates, merging any newly uploaded files with previously uploaded ones.
📎 Document Upload – ID cards, parents' ID cards, study approval, and bank reference documents are uploaded via Multer and stored on Cloudinary.
📊 Automatic Filtering & Sorting for Admins – The admin dashboard supports server-side filtering by national ID, submission date range, number of siblings, city, and annual tuition range, plus sorting by date/siblings/tuition — all executed as MongoDB queries rather than in-memory filtering, so it scales with the dataset.
✅ Status Workflow – Applications move through draft → pending → approved/rejected; every status change triggers an automatic email notification to the applicant (non-blocking — a failed email never breaks the request).
📍 Status Tracking – Applicants can check their current application status at any time.
Data Model
User – idNumber (unique), firstName, lastName, email, hashed password, role (user | admin).
Application – linked to a User, and grouped into personalInfo, familyInfo (including a dynamic siblings list), studyInfo, bankInfo, and documents (uploaded files metadata), plus status and isDraft flags.
Project Structure
Students_Grants/
├── students_grants_server/
│   ├── Controllers/       # user.js (auth), application.js (submit/status/admin review)
│   ├── Middlewares/       # auth.js (JWT + role guard), uploadMiddleware.js (Multer/Cloudinary)
│   ├── Models/             # User, Application
│   ├── Routes/              # auth, applications
│   ├── Utilities/           # mailer.js — status-update emails
│   └── app.js
└── student_grants_client/
    └── src/
        ├── form/            # MainForm + PersonalForm, FamilyForm, StudiesForm, BankForm, VerifyForm
        ├── components/      # Home, Login, SignUp, AdminDashboard, ApplicationStatus, RequestDetails
        ├── redux/           # userSlice, requestSlice, store
        └── routing/         # route guards (RequireAuth, RequireAdmin) and nav links
Setup & Running
Prerequisites
Node.js & npm
A MongoDB instance (local or Atlas)
A Cloudinary account (for file uploads)
SMTP credentials (for status emails)
Backend
bash
cd students_grants_server
npm install
# create a .env file (see Environment Variables below)
npm run dev
Frontend
bash
cd student_grants_client
npm install
npm start
Environment Variables

Create a .env file inside students_grants_server/:

MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...

Built with React, Redux Toolkit, Node.js, and MongoDB
