import { withRouter } from 'react-router-dom';
import {start_saga_ws, stop_saga_ws} from './saga_ws'

import {
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAILURE,
  LOGIN_USER_REQUEST,
  LOGOUT_USER,
  REGISTER_USER_FAILURE,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  STORE_DERIBIT_KEYS} from '../constants';

import { parseJSON } from '../../utils/misc';
import { get_token, create_user, get_api_keys } from '../../utils/http_functions';
import jwtDecode from "jwt-decode";
const Store = require('electron-store');

const schema = {
  token: {
    type: 'string'
  },
  email: {
    type: 'string'
  },
  api_pubkey: {
    type: 'string'
  },
  api_privkey: {
    type: 'string'
  }
};
const store = new Store({ schema });

//TODO: TEST login and key storage, handle the errors right way

export function loginUserSuccess(token) {
  return {
    type: LOGIN_USER_SUCCESS,
    payload: {
      token
    }
  };
}


export function loginUserFailure(error) {
  // store.delete('token');
  return {
    type: LOGIN_USER_FAILURE,
    payload: {
      status: error.response.status,
      statusText: error.response.statusText
    }
  };
}

export function loginUserRequest() {
  return {
    type: LOGIN_USER_REQUEST
  };
}

export function logout() {
  store.delete('token');
  store.delete('api_pubkey');
  store.delete('api_privkey');
  return {
    type: LOGOUT_USER
  };
}

export function logoutAndRedirect(history) {
  return dispatch => {
    dispatch(logout());
    dispatch(stop_saga_ws());
    history.push('/');
  };
}

export function redirectToRoute(route) {
  return () => {
    browserHistory.push(route);
  };
}

export function  loginUser(email, password, history) {
  return function(dispatch) {
    dispatch(loginUserRequest());
    return get_token(email, password)
      .then(parseJSON)
      .then(response=> {
        store.set('token', response.token);
        dispatch(loginUserSuccess(response.token));
        return get_api_keys(response.token, email, password)
        .then(parseJSON)
        .then((resp)=>{
          console.log("get api keys", resp)
          store.set('api_pubkey', resp.api_pubkey);
          store.set('api_privkey', resp.api_privkey);
          dispatch(storeDeribitAccount(resp.api_pubkey, resp.api_privkey));
          return history.push('/');
        })
        .catch((e)=>{
          console.log("Exceprion", e)
          return history.push('/profile');
        })
      })
    .catch((e) => {
        dispatch(loginUserFailure({
            response: {
              status: e.response.status,
              statusText: e.response.data.message
            }
          })
          );
});
}
}

export function registerUserRequest() {
  return {
    type: REGISTER_USER_REQUEST
  };
}

export function registerUserSuccess(token) {
  store.set('token', token);
  return function(dispatch){
    dispatch({
      type: REGISTER_USER_SUCCESS,
        payload: {
      token
    }
    });
  }
}

export function registerUserFailure(error) {
  localStorage.removeItem('token');
  return {
    type: REGISTER_USER_FAILURE,
    payload: {
      status: error.response.status,
      statusText: error.response.statusText
    }
  };
}

export function registerUser(email, password, history) {
  return function(dispatch) {
    dispatch(registerUserRequest());
    create_user(email, password)
      .then(parseJSON)
      .then(response => {
          dispatch(registerUserSuccess(response.token));
          history.push('/');
      })
      .catch(e => {
        dispatch(
          registerUserFailure({
            response: {
              status: e.response.status,
              statusText: e.response.data.message
            }
          })
        );
      });
  };
}

export function storeDeribitAccount(api_pubkey, api_privkey) {
  return {
    type: STORE_DERIBIT_KEYS,
    api_pubkey: api_pubkey,
    api_privkey: api_privkey
  };
}
