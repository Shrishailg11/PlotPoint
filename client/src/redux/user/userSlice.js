import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cuurentUser : null,
    error : null,
    loading : false,
}

const userSlice = createSlice({
    name : 'user',
    initialState,
    reducers : {
        signInStart : (state) =>{
            state.loading = true;
        },
        singInSuccess : (state , action) =>{
            state.cuurentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        singInFailure : (state , action) =>{
            state.error = action.payload;
            state.loading = false;
        }
    }
})

export const {signInStart, singInFailure, singInSuccess} = userSlice.actions;

export default userSlice.reducer;