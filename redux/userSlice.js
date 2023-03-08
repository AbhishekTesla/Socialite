import { createSlice } from '@reduxjs/toolkit'

const initialState = {
 userDetails:{},
}  //Global items variable

export const userSlice = createSlice({
  name: 'userProps',
  initialState,
  reducers: {
    addToUser:(state,action)=>{
        state.userDetails={...action.payload};
    }
  },
})

// Action creators are generated for each case reducer function
export const { addToUser} = userSlice.actions

export const selectUser = (state)=>state.user.userDetails;

export default userSlice.reducer;