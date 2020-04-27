
import {all, takeEvery, put, call, take, fork} from 'redux-saga/effects'
import {fetchSuccess} from '../redux/actions/fetch'
import axios from 'axios';

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
