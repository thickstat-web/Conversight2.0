import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORYBOARD_REDUCER } from '@/Constants/redux';
import { RootState } from '..';

export interface PinnedItem {
  id: string;
  title: string;
  renderType: string;
  pinboardId: string;
  datasetId: string;
  createdAt: string;
}

interface StoryboardState {
  storyboard: PinnedItem[];
  componentsDatasetIds: {
    [pinBoardID: string]: string[];
  };
}

const initialState: StoryboardState = {
  storyboard: [],
  componentsDatasetIds: {},
};

const storyBoardSlice = createSlice({
  name: STORYBOARD_REDUCER,
  initialState,
  reducers: {
    setStoryBoard: (state, action: PayloadAction<PinnedItem[]>) => {
      state.storyboard = action.payload;
    },

    setComponentsDatasetIds: (
      state,
      action: PayloadAction<{ pinBoardID: string; componentsDatasetIds: string[] }>
    ) => {
      const { pinBoardID, componentsDatasetIds } = action.payload;
      const existing = state.componentsDatasetIds[pinBoardID] || [];

      state.componentsDatasetIds[pinBoardID] = Array.from(new Set([
        ...existing,
        ...componentsDatasetIds,
      ]));
    },
  },
});

export const { setStoryBoard, setComponentsDatasetIds } = storyBoardSlice.actions;

export const getStoryBoardData = (state: RootState) => state.storyboardReducer;

export default storyBoardSlice.reducer;
