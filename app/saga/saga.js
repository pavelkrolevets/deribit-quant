import {eventChannel} from 'redux-saga';
import {all, takeEvery, put, call, take, fork, race, select, cancel, cancelled, delay} from 'redux-saga/effects'
import axios from 'axios';
import {
  DERIBIT_AUTH,
  START_CHANNEL,
  STOP_CHANNEL } from '../redux/reducers/saga_ws';

import {saga_hist_vola} from './saga_hist_vola'
import {updateMarketData,
  start_deribit_priv_sync,
  stop_deribit_priv_sync } from '../redux/actions/saga_ws'
const Store = require('electron-store');
const store = new Store();
import { deribit_api } from '../components/Deribit/OptionsPos/requests';




function createEventChannel(ws, state) {
  return eventChannel(emit => {
    ws.onopen = () => {
      console.log("Opening Websocket");
      // return emit({data: JSON.parse(e.data)})
      // ws.send(JSON.stringify(auth_msg))
      authDeribitWs(ws, state)
    };

    ws.onerror = error => {
      console.log("ERROR: ", error);
    };

    ws.onmessage = e => {
      return emit({data: JSON.parse(e.data)})
    };

    ws.onclose = e => {
      if (e.code === 1005) {
        console.log("WebSocket: closed");
      } else {
        console.log('Socket is closed Unexpectedly. Reconnect will be attempted in 5 second.', e.reason);
        setTimeout(() =>  {
          createEventChannel();
        }, 5000);
      }
    };

    return () => {
      console.log("Closing Websocket from channel");
      ws.close();
    };
  });
}


function * initializeWebSocketsChannel(ws) {
  console.log("going to connect to WS");
  let state = yield select();
  const channel = yield call(createEventChannel, ws, state);
  while (true) {
    const {data} = yield take(channel);
    yield put(updateMarketData(data));
  }
}

function * wsMessages(ws){
      console.log("Start sending requests to deribit ws");
      let get_index = deribit_api('BTC', 'index', 42);
      console.log("Index msg", get_index);
      ws.send(JSON.stringify(get_index));

      // setInterval(() =>  {
      //
      // }, 5000);

}

function authDeribitWs (ws, state) {
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
  return ws.send(JSON.stringify(auth_msg));
}

export function * startStopChannel() {
  //Subscribe to websocket
  const ws = new WebSocket('wss://www.deribit.com/ws/api/v2/');
  yield fork(startDeribitSync, ws);
  while (true) {
    yield take(START_CHANNEL);
    yield race({
      task: call(initializeWebSocketsChannel, ws),
      cancel: take(STOP_CHANNEL),
    });
    //if cancel wins the race we can close socket
    console.log("Closing Websocket");
    ws.close();
  }
}

function* deribitMsgSync(ws) {
  try {
    while (true) {
      yield put(start_deribit_priv_sync);
      yield call(wsMessages, ws);
      yield delay(5000)
    }
  } finally {
    if (yield cancelled())
      console.log('Sync cancelled!');
      yield put(stop_deribit_priv_sync)
  }
}

function* startDeribitSync(ws) {
  while ( yield take(DERIBIT_AUTH) ) {
    // starts the task in the background
    const bgSyncTask = yield fork(deribitMsgSync,ws);
    // wait for the user stop action
    yield take(STOP_CHANNEL);
    // user clicked stop. cancel the background task
    yield cancel(bgSyncTask)
  }
}

///// ROOOT SAGA
export default function* rootSaga() {
  yield all ([
    startStopChannel(), saga_hist_vola()
  ]);
}
