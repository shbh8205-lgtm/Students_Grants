import { createSlice } from "@reduxjs/toolkit"
import swal from "sweetalert"

const initialState = {
    current: {},
    token: localStorage.getItem('token') || null,
}

const userSlice = createSlice({
    name: 'user',

    initialState,

    reducers: {
        setCurrent: (state, action) => {
            state.current = action.payload;
            state.token = action.payload?.token || null;
            if (action.payload?.token) {
                localStorage.setItem('token', action.payload.token);
            }
        },

        setToken: (state, action) => {
            state.token = action.payload;
            if (action.payload) {
                localStorage.setItem('token', action.payload);
            } else {
                localStorage.removeItem('token');
            }
        },

        logout: (state) => {
            state.current = { firstName: "אורח" };
            state.token = null;
            localStorage.removeItem('token');
        }
    }
})

export const { setCurrent, setToken, logout } = userSlice.actions

export default userSlice.reducer