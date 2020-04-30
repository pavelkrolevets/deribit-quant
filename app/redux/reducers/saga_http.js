export const START_HIST_VOLA_FETCH = 'START_HIST_VOLA_FETCH';
export const STOP_HIST_VOLA_FETCH = 'STOP_HIST_VOLA_FETCH';
export const HIST_VOLA_DATA = 'HIST_VOLA_DATA';
export const HIST_VOLA_WINDOW = 'HIST_VOLA_WINDOW';
export const HIST_VOLA_TIMEFRAME = 'HIST_VOLA_TIMEFRAME';
export const HIST_VOLA_CURRENCY = 'HIST_VOLA_CURRENCY';
export const HIST_VOLA_REQUEST_FAIL = 'HIST_VOLA_REQUEST_FAIL';

const initialState = {
  hist_vola_fetching: true,
  hist_vola_data: {data: {hist_vola: []}},
  hist_vola_window: 21,
  hist_vola_timeframe: '1d',
  hist_vola_currency: 'BTC',
  hist_vola_request_fail: false
};

export default function saga_http (state = initialState, action) {
  switch (action.type) {
    case START_HIST_VOLA_FETCH:
      return {
        ...state,
        hist_vola_fetching: true,
      };

    case STOP_HIST_VOLA_FETCH:
      return {
        ...state,
        hist_vola_fetching: false,
      };

    case HIST_VOLA_DATA:
      return {
        ...state,
        hist_vola_data: action.hist_vola_data,
      };

    case HIST_VOLA_WINDOW:
      return {
        ...state,
        hist_vola_window: action.hist_vola_window,
      };

    case HIST_VOLA_TIMEFRAME:
      return {
        ...state,
        hist_vola_timeframe: action.hist_vola_timeframe,
      };

    case HIST_VOLA_CURRENCY:
      return {
        ...state,
        hist_vola_currency: action.hist_vola_currency,
      };

    case HIST_VOLA_REQUEST_FAIL:
      return {
        ...state,
        hist_vola_request_fail: true,
      };

    default:
      return state;
  }
}
