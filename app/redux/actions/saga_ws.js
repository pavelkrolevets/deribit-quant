import {
  STOP_CHANNEL,
  START_CHANNEL,
  WS_DATA,
  DERIBIT_AUTH,
  DERIBIT_PRIV_SYNC_ON,
  DERIBIT_PRIV_SYNC_OFF,
  WS_ERROR,
  WS_CONNECTED,
  DERIBIT_BTC_INDEX,
  DERIBIT_BTC_FUTURES_POS,
  DERIBIT_BTC_OPTIONS_POS,
  DERIBIT_ACCOUNT_STATE,
  DERIBIT_OPEN_POSITIONS,
  DERIBIT_BTC_ALL_INSTRUMENTS,
} from '../reducers/saga_ws';


export function updateMarketData(data) {

  if (data.id === 777) {
    return {
      type: DERIBIT_AUTH,
    };
  }

  if (data.id === 1001) {
    // console.log("BTC index", data.result.edp);
    return {
      type: DERIBIT_BTC_INDEX,
      data
    };
  }

  if (data.id === 1002) {
    // console.log("BTC futures pos", data.result);
    return {
      type: DERIBIT_BTC_FUTURES_POS,
      data
    };
  }

  if (data.id === 1003) {
    // console.log("BTC options pos", data.result);
    return {
      type: DERIBIT_BTC_OPTIONS_POS,
      data
    };
  }

  if (data.id === 1004) {
    // console.log("Deribit account state", data.result);
    return {
      type: DERIBIT_ACCOUNT_STATE,
      data
    };
  }

  if (data.id === 1005) {
    // console.log("Deribit open pos", data.result);
    return {
      type: DERIBIT_OPEN_POSITIONS,
      data
    };
  }

  if (data.id === 1006) {
    // console.log("Deribit btc all instruments", data.result);
    return {
      type: DERIBIT_BTC_ALL_INSTRUMENTS,
      data
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

export function ws_error(error) {
  alert(error);
  return {
    type: WS_ERROR,
    error
  };
}

export function connectionSuccess() {
  // console.log("Connection success");
  return {
    type: WS_CONNECTED,
  };
}

