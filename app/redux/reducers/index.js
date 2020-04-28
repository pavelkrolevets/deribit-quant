// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import auth from './auth';
import data from './data';
import socket from './socket';
import fetch from './fetch'
import sagas from './saga_ws'

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    auth,
    data,
    socket,
    fetch,
    sagas
  });
}
