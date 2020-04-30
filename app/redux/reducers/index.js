// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import auth from './auth';
import sagas from './saga_ws'
import saga_http from './saga_http'

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    auth,
    sagas,
    saga_http
  });
}
