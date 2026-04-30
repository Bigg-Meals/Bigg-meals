import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '../../util/errors';
import {
  fetchZipCodes,
  addZipCode as addZipCodeApi,
  removeZipCode as removeZipCodeApi,
} from '../../util/api';

// ================ Async thunks (plain thunks, no SDK needed) ================ //

export const loadData = () => dispatch => {
  dispatch(fetchZipCodesRequest());
  return fetchZipCodes()
    .then(data => {
      dispatch(fetchZipCodesSuccess(data.zipCodes || []));
    })
    .catch(e => {
      dispatch(fetchZipCodesError(storableError(e)));
    });
};

// Alias used for app-level initialization (not tied to AdminZipCodesPage route)
export const loadZipCodes = loadData;

export const addZipCode = zipCode => dispatch => {
  dispatch(addZipCodeRequest());
  return addZipCodeApi({ zipCode })
    .then(data => {
      dispatch(addZipCodeSuccess(data.zipCodes || []));
      return data;
    })
    .catch(e => {
      dispatch(addZipCodeError(storableError(e)));
      throw e;
    });
};

export const removeZipCode = zipCode => dispatch => {
  dispatch(removeZipCodeRequest(zipCode));
  return removeZipCodeApi({ zipCode })
    .then(data => {
      dispatch(removeZipCodeSuccess(data.zipCodes || []));
      return data;
    })
    .catch(e => {
      dispatch(removeZipCodeError(storableError(e)));
      throw e;
    });
};

// ================ Slice ================ //

const initialState = {
  zipCodes: [],
  fetchInProgress: false,
  fetchError: null,
  addInProgress: false,
  addError: null,
  removingZipCode: null,
  removeError: null,
};

const adminZipCodesPageSlice = createSlice({
  name: 'app/AdminZipCodesPage',
  initialState,
  reducers: {
    fetchZipCodesRequest(state) {
      state.fetchInProgress = true;
      state.fetchError = null;
    },
    fetchZipCodesSuccess(state, action) {
      state.fetchInProgress = false;
      state.zipCodes = action.payload;
    },
    fetchZipCodesError(state, action) {
      state.fetchInProgress = false;
      state.fetchError = action.payload;
    },
    addZipCodeRequest(state) {
      state.addInProgress = true;
      state.addError = null;
    },
    addZipCodeSuccess(state, action) {
      state.addInProgress = false;
      state.zipCodes = action.payload;
    },
    addZipCodeError(state, action) {
      state.addInProgress = false;
      state.addError = action.payload;
    },
    removeZipCodeRequest(state, action) {
      state.removingZipCode = action.payload;
      state.removeError = null;
    },
    removeZipCodeSuccess(state, action) {
      state.removingZipCode = null;
      state.zipCodes = action.payload;
    },
    removeZipCodeError(state, action) {
      state.removingZipCode = null;
      state.removeError = action.payload;
    },
  },
});

export const {
  fetchZipCodesRequest,
  fetchZipCodesSuccess,
  fetchZipCodesError,
  addZipCodeRequest,
  addZipCodeSuccess,
  addZipCodeError,
  removeZipCodeRequest,
  removeZipCodeSuccess,
  removeZipCodeError,
} = adminZipCodesPageSlice.actions;

export default adminZipCodesPageSlice.reducer;
