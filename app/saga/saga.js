import {eventChannel} from 'redux-saga';
import {all, takeEvery, put, call, take, fork, race, select} from 'redux-saga/effects'
import {fetchSuccess} from '../redux/actions/fetch'
import axios from 'axios';
import {START_CHANNEL, STOP_CHANNEL} from "../redux/constants/index"
import {updateMarketData} from '../redux/actions/saga_ws'
const Store = require('electron-store');
const store = new Store();

import { deribit_api } from '../components/Deribit/OptionsPos/requests';

export function* helloSaga() {
  console.log('Hello Sagas!')
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export function *fetchSaga() {
  while (true) {
    const result = yield call(axios.get, 'http://worldtimeapi.org/api/ip');
    console.log(result);
    yield delay(10000);
    yield put(fetchSuccess(result.data));
  }
}
function createEventChannel(ws, state) {

  return eventChannel(emit => {


    ws.onopen = () => {
      console.log("Opening Websocket");
      // return emit({data: JSON.parse(e.data)})
      // ws.send(JSON.stringify(auth_msg))
      authWsMsg(ws, state).then(()=> wsMessages(ws))
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
      console.log("Closing Websocket");
      ws.close();
    };
  });
}


function * initializeWebSocketsChannel(ws) {
  console.log("going to connect to WS");
  let state = yield select();
  const channel = yield call(createEventChannel, ws, state);

  // const message_chan = yield call(authWsMessage, ws);
  // yield fork(wsMessages, ws);

  while (true) {
    const {data} = yield take(channel);
    yield put(updateMarketData(data));
  }
}

function wsMessages(ws){
    setInterval(() =>  {
      console.log("Sending request to ws");
      let get_index = deribit_api('BTC', 'index', 42);
      console.log("Index msg", get_index);
      ws.send(JSON.stringify(get_index));

      }, 5000);
}

async function authWsMsg (ws, state) {
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
  return await ws.send(JSON.stringify(auth_msg));
}

export function * startStopChannel() {
  //Subscribe to websocket
  const ws = new WebSocket('wss://www.deribit.com/ws/api/v2/');

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

export default function* rootSaga() {
  yield all ([
    startStopChannel()
  ]);
}
