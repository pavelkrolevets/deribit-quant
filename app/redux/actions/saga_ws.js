import {
  INITIALIZE_WS_CHANNEL,
  STOP_CHANNEL,
  START_CHANNEL,
  WS_DATA, LOGOUT_USER
} from '../constants/index';


export function updateMarketData(data) {
  return {
    type: WS_DATA,
    data
  };
}

export function start_saga_ws() {
  return {
    type: START_CHANNEL
  };
}

export function stop_saga_ws() {
  return {
    type: STOP_CHANNEL
  };
}

