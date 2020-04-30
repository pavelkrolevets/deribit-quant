import {
  STOP_CHANNEL,
  START_CHANNEL,
  WS_DATA,
  DERIBIT_AUTH,
  DERIBIT_PRIV_SYNC_ON,
  DERIBIT_PRIV_SYNC_OFF
} from '../reducers/saga_ws';


export function updateMarketData(data) {

  if (data.id === 777) {
    return {
      type: DERIBIT_AUTH,
    };
  }

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

export function start_deribit_priv_sync() {
  return {
    type: DERIBIT_PRIV_SYNC_ON
  };
}

export function stop_deribit_priv_sync() {
  return {
    type: DERIBIT_PRIV_SYNC_OFF
  };
}


