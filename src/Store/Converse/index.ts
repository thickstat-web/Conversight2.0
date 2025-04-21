import { CONVERSE_REDUCER } from '@/Constants/redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';

interface ConverseState {
    [converseId: string]: {
        response?: any;
        messages?: any[];
    };
}

const initialState: ConverseState = {};

const athenaChatSlice = createSlice({
    name: CONVERSE_REDUCER,
    initialState,
    reducers: {
        setConverseResponse(state, action: PayloadAction<{ converseId: string; response: any }>) {
            const { converseId, response } = action.payload;
            state[converseId] = {
                ...state[converseId],
                response,
            };
        },
    },
});


export const getConverseResponse = (state: RootState) => state.converseReducer

export const { setConverseResponse } = athenaChatSlice.actions;
export default athenaChatSlice.reducer;
