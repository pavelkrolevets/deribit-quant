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
        console.log('Socket is closed Unexpectedly. Reconnect will be attempted in 5 second.', e.reason);
        return emit(END)
        // setTimeout(() =>  {
        //   createEventChannel();
        // }, 5000);
      }
    };

    const unsubscribe = () => {
      ws.onmessage = null;
    };

    return unsubscribe
  });
}

function * createWebSocketConnection() {

  return new Promise((resolve, reject) => {
    const socket = new WebSocket('wss://www.deribit.com/ws/api/v2/');
    socket.onopen = function () {
      resolve(socket);
    };
    socket.onerror = function (evt) {
      reject(evt);
    }
  });
}



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

    while (true) {
      // try {
        const { data } = yield take(ws_channel);
        yield put(WS_live.updateMarketData(data));
      // } finally {
      //   console.error('socket error: reconnecting');
      //   yield put(WS_DISCONNECTED);
      //   yield delay(5000);
      // }
    }

  } catch (error) {
    yield put(WS_live.ws_error(error.message));
  } finally {
    if (yield cancelled()) {
      // close the channel
      ws_channel.close();
      // close the WebSocket connection
      console.log("WS",ws);
      ws.close()
    } else {
      yield put(WS_live.ws_error('WebSocket disconnected'));
    }
  }


}

function wsMessages(ws){
      console.log("Start sending requests to deribit ws");
      let get_index = deribit_api('BTC', 'index', 42);
      console.log("Index msg", get_index);
      ws.send(JSON.stringify(get_index))
}

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

  // return new Promise((resolve, reject)=> {
  //   resolve();
  //   reject("Error")
  // })
}

// export function * startStopChannel() {
//   //Subscribe to websocket
//   while (true) {
//     yield take(START_CHANNEL);
//     yield race({
//       task: call(initializeWebSocketsChannel),
//       cancel: take(STOP_CHANNEL),
//     });
//     //if cancel wins the race we can close socket
//     // console.log("Closing Websocket");
//     // ws.close();
//   }
// }

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


function* deribitMsgSync() {
  try {
    while (true) {
      yield put(start_deribit_priv_sync);
      yield call(wsMessages);
      yield delay(5000)
    }
  } finally {
    if (yield cancelled())
      console.log('Sync cancelled!');
      yield put(stop_deribit_priv_sync)
  }
}

function* startDeribitSync() {

  while ( yield take(DERIBIT_AUTH) ) {
    // starts the task in the background
    const WsMsgTask = yield fork(deribitMsgSync);
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
