import { withRouter } from 'react-router-dom';
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
  DERIBIT_BTC_ACCOUNT_STATE,
  DERIBIT_BTC_OPEN_POSITIONS,
  DERIBIT_BTC_ALL_INSTRUMENTS,
  DERIBIT_API_TESTNET,
  DERIBIT_API_REALNET,
  DERIBIT_ETH_ACCOUNT_STATE,
  DERIBIT_ETH_ALL_INSTRUMENTS,
  DERIBIT_ETH_INDEX,
  DERIBIT_ETH_OPEN_POSITIONS,
  DERIBIT_AUTH_ERROR,
  DERIBIT_TRADINGVIEW_DATA,
} from '../reducers/saga_ws';
import { LOGIN_USER_REQUEST } from '../constants';

export function updateMarketData(data) {
  if (data.id === 777 && data.error === undefined) {
    console.log('Data auth', data);
    return {
      type: DERIBIT_AUTH
    };
  }

  if (data.id === 777 && data.error !== undefined) {
    console.log('Data auth', data);
    return dispatch => {
      alert('Please provide working Deribit API keys');
      dispatch(loginDeribitError());
      dispatch(stop_saga_ws());
    };
  }

  if (data.id === 2001) {
    // console.log("ETH index", data.result.edp);
    return {
      type: DERIBIT_ETH_INDEX,
      data
    };
  }

  if (data.id === 2004) {
    // console.log("Deribit ETH account state", data.result);
    return {
      type: DERIBIT_ETH_ACCOUNT_STATE,
      data
    };
  }

  if (data.id === 2005) {
    // console.log("Deribit ETH open pos", data.result);
    return {
      type: DERIBIT_ETH_OPEN_POSITIONS,
      data
    };
  }

  if (data.id === 2006) {
    // console.log("Deribit ETH all instruments", data.result);
    return {
      type: DERIBIT_ETH_ALL_INSTRUMENTS,
      data
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
    // console.log("Deribit BTC account state", data.result);
    return {
      type: DERIBIT_BTC_ACCOUNT_STATE,
      data
    };
  }

  if (data.id === 1005) {
    // console.log("Deribit BTC open pos", data.result);
    return {
      type: DERIBIT_BTC_OPEN_POSITIONS,
      data
    };
  }

  if (data.id === 1006) {
    // console.log("Deribit BTC all instruments", data.result);
    return {
      type: DERIBIT_BTC_ALL_INSTRUMENTS,
      data
    };
  }

  if (data.id === 3001) {
    // console.log("Deribit Tradeview chart data", data);
    return {
      type: DERIBIT_TRADINGVIEW_DATA,
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
    type: WS_CONNECTED
  };
}

export function deribit_testnet() {
  return {
    type: DERIBIT_API_TESTNET
  };
}

export function deribit_realnet() {
  return {
    type: DERIBIT_API_REALNET
  };
}

export function loginDeribitError() {
  return {
    type: DERIBIT_AUTH_ERROR
  };
}
// export function send_to_profile(history) {
//   return {
//     history.push('/');
//   };
// }
