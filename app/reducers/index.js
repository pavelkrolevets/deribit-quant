// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import account from './account';
import auth from './auth';
import data from './data';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    account,
    auth,
    data,
  });
}
