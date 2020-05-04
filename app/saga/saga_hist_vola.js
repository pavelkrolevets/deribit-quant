import {eventChannel} from 'redux-saga';
import {all, takeEvery, put, call, take, fork, race, select, cancel, cancelled, delay} from 'redux-saga/effects'
import {START_HIST_VOLA_FETCH, STOP_HIST_VOLA_FETCH } from '../redux/reducers/saga_http';
import {get_hist_vola } from '../utils/http_functions';
import {hist_vola_data, request_fail} from '../redux/actions/saga_http'
import { startStopChannel } from './saga_deribit';

function* bgSync() {
  try {
    while (true) {
      let state = yield select();
      // console.log("State",state.auth.token, state.auth.userName, state.saga_http.hist_vola_window, state.saga_http.hist_vola_timeframe, state.saga_http.hist_vola_currency);
      const result = yield call(get_hist_vola, state.auth.token, state.auth.userName, state.saga_http.hist_vola_window, state.saga_http.hist_vola_timeframe, state.saga_http.hist_vola_currency);
      yield put(hist_vola_data(result));
      yield delay(1000)
    }
  } finally {
    if (yield cancelled())
      yield put(request_fail())
  }
}

export function* saga_hist_vola() {
  while ( yield take(START_HIST_VOLA_FETCH) ) {
    // starts the task in the background
    const bgSyncTask = yield fork(bgSync);

    // wait for the user stop action
    yield take(STOP_HIST_VOLA_FETCH);
    // user clicked stop. cancel the background task
    // this will cause the forked bgSync task to jump into its finally block
    yield cancel(bgSyncTask)
  }
}
