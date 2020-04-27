import { RECEIVE_PROTECTED_DATA, FETCH_PROTECTED_DATA_REQUEST } from '../constants';


const initialState = {
  data: null,
  isFetching: false,
  loaded: false,
};

export default function Data (state = initialState, action) {
  switch (action.type) {
    case RECEIVE_PROTECTED_DATA:
      return {
        ...state,
        data: action.payload.data,
        isFetching: false,
        loaded: true,
      };
    case FETCH_PROTECTED_DATA_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    default:
      return state;
  }
};
