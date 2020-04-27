import {
  FETCH_FAILURE,
  FETCH_SUCCESS} from '../constants';



export function fetchSuccess(data) {
  return {
    type: FETCH_SUCCESS,
    data
  };
}

export function fetchFail(error) {
  return {
    type: FETCH_FAILURE,
    error
  };
}
