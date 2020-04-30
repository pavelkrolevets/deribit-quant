import {
  START_HIST_VOLA_FETCH,
  STOP_HIST_VOLA_FETCH,
  HIST_VOLA_DATA,
  HIST_VOLA_WINDOW,
  HIST_VOLA_TIMEFRAME,
  HIST_VOLA_CURRENCY,
  HIST_VOLA_REQUEST_FAIL
} from '../reducers/saga_http';


export function hist_vola_data(hist_vola_data) {
  return {
    type: HIST_VOLA_DATA,
    hist_vola_data
  };
}

export function start_hist_vola() {
  return {
    type: START_HIST_VOLA_FETCH
  };
}

export function stop_hist_vola() {
  return {
    type: STOP_HIST_VOLA_FETCH
  };
}

export function set_hist_vola_window(hist_vola_window) {
  return {
    type: HIST_VOLA_WINDOW,
    hist_vola_window
  };
}

export function set_hist_vola_timeframe(hist_vola_timeframe) {
  return {
    type: HIST_VOLA_TIMEFRAME,
    hist_vola_timeframe
  };
}

export function set_hist_vola_currency(hist_vola_currency) {
  return {
    type: HIST_VOLA_CURRENCY,
    hist_vola_currency
  };
}

export function request_fail() {
  return {
    type: HIST_VOLA_REQUEST_FAIL
  };
}

// export function get_hist_vola_data(token, email, window, timeframe, instrument) {
//   return function(dispatch) {
//     return get_hist_vola(token, email, window, timeframe, instrument)
//       .then(parseJSON)
//       .then(response => {
//         try {
//           dispatch(hist_vola_data(response.data));
//         } catch (e) {
//           dispatch(
//             registerUserFailure({
//               response: {
//                 status: 403,
//                 statusText: 'Invalid token'
//               }
//             })
//           );
//         }
//       })
//   };
// }
