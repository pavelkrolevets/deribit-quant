import { FETCH,
  FETCH_FAILURE,
  FETCH_SUCCESS} from '../constants';

const initialState = {
  data: null,
  isFetching: false,
  loaded: false,
  fetch_error: null
};

export default function Fetch (state = initialState, action) {
  switch (action.type) {
    case FETCH_SUCCESS:
      return {
        ...state,
        data: action.data,
        isFetching: false,
        loaded: true,
      };
    case FETCH_FAILURE:
      return {
        ...state,
        fetch_error: action.error,
      };
    case FETCH:
      return {
        ...state,
        isFetching: true,
      };
    default:
      return state;
  }
};
