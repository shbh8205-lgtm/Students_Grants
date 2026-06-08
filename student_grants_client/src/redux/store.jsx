import { configureStore } from "@reduxjs/toolkit";
import  requestReducer  from "./requestSlice";
import  userReducer  from "./userSlice";

const store = configureStore({
    reducer: {
        request: requestReducer,
        user: userReducer
    }
})
export default store