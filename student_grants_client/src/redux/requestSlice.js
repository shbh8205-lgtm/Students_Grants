import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // נתונים של הבקשה הנוכחית (הטופס)
    selfDetails: {},
    familyDetails: {},
    bankDetails: {},
    studies: {},
    documents: {},

    // רשימת כל הבקשות (לצפייה של מנהל או משתמש)
    loading: false
};

const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: {
        
        saveStepData: (state, action) => {
            const { step, data } = action.payload;

            // בתוך requestSlice.js -> saveStepData
            if (step === 'all') {
                state.selfDetails = data.selfDetails || {};
                state.familyDetails = data.familyDetails || {};
                state.bankDetails = data.bankDetails || {};
                state.studies = data.studies || {};
                state.documents = data.documents || {};
            } else {
                // עדכון של שלב ספציפי (למשל בזמן מילוי הטופס)
                state[step] = data;
            }
        },

        // איפוס הבקשה הנוכחית (למשל אחרי שליחה מוצלחת)
        resetCurrentApplication: (state) => {
            state.selfDetails = {};
            state.familyDetails = {};
            state.bankDetails = {};
            state.studies = {};
            state.documents = {};
        },

        addFile: (state, action) => {
            const { fileName, file } = action.payload
            state.documents[fileName] = file
        }
    }
});

export const {
    saveStepData,
    resetCurrentApplication,
    addFile
} = requestSlice.actions;

export default requestSlice.reducer;