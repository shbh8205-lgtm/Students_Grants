import mongoose from 'mongoose';

const siblingSchema = new mongoose.Schema(
    {
        idNumber: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        birthDate: { type: Date },
    },
    { _id: false }
);

const fileSchema = new mongoose.Schema(
    {
        originalName: { type: String },
        path: { type: String },     // public path served via /uploads/...
        mimeType: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const applicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        personalInfo: {
            idNumber: { type: String },
            mobilePhone: { type: String },
            homePhone: { type: String },
            birthDate: { type: Date },
            city: { type: String },
            address: { type: String },
            zipCode: { type: String },
        },

        familyInfo: {
            father: {
                firstName: { type: String },
                lastName: { type: String },
            },
            mother: {
                firstName: { type: String },
                lastName: { type: String },
            },
            siblingsUnder18: { type: Number, default: 0 },
            siblingsOver21WithMultipleChildren: { type: Number, default: 0 },
            siblingsList: { type: [siblingSchema], default: [] },
        },

        studyInfo: {
            institution: { type: String },
            major: { type: String },
            annualTuition: { type: Number, default: 0 },
            yearsOfStudy: { type: Number, default: 0 },
        },

        bankInfo: {
            accountOwnerId: { type: String },
            bankName: { type: String },
            branchNumber: { type: String },
            accountNumber: { type: String },
        },

        documents: {
            idCard: { type: fileSchema, default: null },
            fatherIdCard: { type: fileSchema, default: null },
            motherIdCard: { type: fileSchema, default: null },
            studyApproval: { type: fileSchema, default: null },
            bankReference: { type: fileSchema, default: null },
        },

        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected'],
            default: 'pending',
        },
        isDraft: { type: Boolean, default: false },

        emailForUpdates: { type: String, trim: true, lowercase: true },
        submissionDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
