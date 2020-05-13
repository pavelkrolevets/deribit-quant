import {eventChannel, END} from 'redux-saga';
import {all, takeEvery, put, call, take, fork, race, select, cancel, cancelled, delay} from 'redux-saga/effects'
import axios from 'axios';
import {
  DERIBIT_AUTH,
  START_CHANNEL,
  STOP_CHANNEL,
  WS_CONNECTED,
  WS_DISCONNECTED} from '../redux/reducers/saga_ws';

import {saga_hist_vola} from './saga_hist_vola'
import * as WS_live from '../redux/actions/saga_ws'
const Store = require('electron-store');
const store = new Store();
import { deribit_api } from '../components/Deribit/OptionsPos/requests';
const WebSocket = require('ws');


function createEventChannel(ws, state) {
  return eventChannel(emit => {

    ws.onerror = error => {
      console.log("ERROR: ", error);
    };

    ws.onmessage = e => {
      return emit({data: JSON.parse(e.data)})
    };

    ws.onclose = e => {
      if (e.code === 1005) {
        console.log("WebSocket: safely closed");
      } else {
        console.log('Socket is closed Unexpectedly. Reconnect in 5 second.', e.reason);
        return emit(END)
      }
    };
    const unsubscribe = () => {
      ws.onmessage = null;
    };

    return unsubscribe
  });
}

// Connect to ws: if success return open instance
function * createWebSocketConnection() {
  let state = yield select();

  return new Promise((resolve, reject) => {
    // console.log("API url", state.sagas.deribit_api_url);
    const socket = new WebSocket(state.sagas.deribit_api_url);
    socket.onopen = function () {
      resolve(socket);
    };
    socket.onerror = function (evt) {
      reject(evt);
    }
  });
}


// Open ws channel, authinticate and start sending msgs
function * initializeWebSocketsChannel() {
  console.log("going to connect to WS");
  // if (ws.readyState === WebSocket.OPEN){
  //   console.log("Ws is already open")
  // }
  let ws;
  let ws_channel;
  let state;
  let socket;

  try {
    state = yield select();
    socket = yield call(createWebSocketConnection);
    ws = yield (socket);
    ws_channel = yield call(createEventChannel, ws, state);
    yield put(WS_live.connectionSuccess());
    yield call(authDeribitWs, ws, state );
    yield fork(startDeribitSync, ws);

    while (true) {
        const { data } = yield take(ws_channel);
        yield put(WS_live.updateMarketData(data));
    }

  } catch (error) {
    yield put(WS_live.ws_error(error.message));
  } finally {
    if (yield cancelled()) {
      // close the channel
      ws_channel.close();
      // close the WebSocket connection
      ws.close();
    } else {
      yield put(WS_live.ws_error('WebSocket disconnected, reconnecting...' ));
      // close the channel
      yield delay(2000);
      ws_channel.start();
    }
  }


}

// Messages requests to ws deribit
function wsDeribitMessages(ws){

    console.log("Start sending requests to deribit ws");

      /// send BTC requests
      let get_index_btc = deribit_api('BTC', 'index', 1001);
      let fut_positions_btc = deribit_api('BTC', 'fut_positions', 1002);
      let opt_positions_btc = deribit_api('BTC', 'opt_positions', 1003);
      let account_btc = deribit_api('BTC', 'account', 1004);
      let positions_btc = deribit_api('BTC', 'positions', 1005);
      let all_instruments_btc = deribit_api('BTC', 'all_instruments', 1006);

      ws.send(JSON.stringify(get_index_btc));
      ws.send(JSON.stringify(fut_positions_btc));
      ws.send(JSON.stringify(opt_positions_btc));
      ws.send(JSON.stringify(account_btc));
      ws.send(JSON.stringify(positions_btc));
      ws.send(JSON.stringify(all_instruments_btc));

      /// send ETH requests
    let get_index_eth = deribit_api('ETH', 'index', 2001);
    let account_eth = deribit_api('ETH', 'account', 2004);
    let positions_eth = deribit_api('ETH', 'positions', 2005);
    let all_instruments_eth = deribit_api('ETH', 'all_instruments', 2006);

    ws.send(JSON.stringify(get_index_eth));
    ws.send(JSON.stringify(account_eth));
    ws.send(JSON.stringify(positions_eth));
    ws.send(JSON.stringify(all_instruments_eth));
}

// Auth message to ws deribit server
function * authDeribitWs (ws, state) {
  let api_pubkey = '';
  let api_privkey = '';
  if (typeof state.auth.api_pubkey === 'undefined' || state.auth.api_pubkey === '') {
    api_pubkey = store.get('api_pubkey');
    api_privkey = store.get('api_privkey');
  } else {
    api_pubkey = state.auth.api_pubkey;
    api_privkey = state.auth.api_privkey;
  }
  console.log("Keys ", api_pubkey, api_privkey);
  let auth_msg = {
    jsonrpc: '2.0',
    id: 777,
    method: 'public/auth',
    params: {
      grant_type: 'client_credentials',
      client_id: api_pubkey,
      client_secret: api_privkey
    }
  };
  ws.send(JSON.stringify(auth_msg));
}

export function * startStopChannel() {
  while ( yield take(START_CHANNEL) ) {
    // starts the task in the background
    const WsTask = yield fork(initializeWebSocketsChannel);
    // wait for the user stop action
    yield take(STOP_CHANNEL);
    // user clicked stop. cancel the background task
    yield cancel(WsTask)
  }
}


function* deribitMsgSync(ws) {
  try {
    while (true) {
      yield put(WS_live.start_deribit_priv_sync());
      yield call(wsDeribitMessages, ws);
      yield delay(5000)
    }
  } finally {
    if (yield cancelled())
      console.log('Sync cancelled!');
      yield put(WS_live.stop_deribit_priv_sync())
  }
}

function* startDeribitSync(ws) {
  while ( yield take(DERIBIT_AUTH) ) {
    // starts the task in the background
    const WsMsgTask = yield call(deribitMsgSync, ws);
    // wait for the user stop action
    yield take(STOP_CHANNEL);
    // user clicked stop. cancel the background task
    yield cancel(WsMsgTask)
  }
}

///// ROOT SAGA
export default function* rootSaga() {
  yield all ([
    startStopChannel(), saga_hist_vola()
  ]);
}
