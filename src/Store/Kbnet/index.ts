import { KBNET_REDUCER } from '@/Constants/redux'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'

interface KBNetState {
    [datasetId: string]: {
        metadata?: any
        synonyms?: any
        tableMetadata?: any
        subjectArea?: any
    }
}



const initialState: KBNetState = {}

const kbnetSlice = createSlice({
    name: KBNET_REDUCER,
    initialState,
    reducers: {
        setMetadata(state, action: PayloadAction<{ datasetId: string; data: any }>) {
            const { datasetId, data } = action.payload
            state[datasetId] = {
                ...state[datasetId],
                metadata: data,
            }
        },
        setSynonyms(state, action: PayloadAction<{ datasetId: string; data: any }>) {
            const { datasetId, data } = action.payload
            state[datasetId] = {
                ...state[datasetId],
                synonyms: data,
            }
        },
        setTableMetadata(state, action: PayloadAction<{ datasetId: string; data: any }>) {
            const { datasetId, data } = action.payload
            state[datasetId] = {
                ...state[datasetId],
                tableMetadata: data,
            }
        },
        setSubjectArea(state, action: PayloadAction<{ datasetId: string; data: any }>) {
            const { datasetId, data } = action.payload
            state[datasetId] = {
                ...state[datasetId],
                subjectArea: data,
            }
        },
        setConfigData(state,action){
            state.configData=action.payload
        },
        

    },
})

export const getKbnetData = (state: RootState) => state.kbnetReducer


export const { setMetadata, setSynonyms, setTableMetadata, setSubjectArea } = kbnetSlice.actions

export default kbnetSlice.reducer
