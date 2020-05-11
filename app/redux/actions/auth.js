import { withRouter } from 'react-router-dom';
import { get_api_keys } from '../../utils/http_functions';
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
import { get_token, create_user } from '../../utils/http_functions';
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
  store.set('token', token);
  return function (dispatch)  {
    dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: {
      token
    }});

  return get_api_keys(token, jwtDecode(token).email)
    .then(
      response => {
        // console.log('Deribit Api Keys', response);
        if (response.status === 200) {

          if(response.data.api_pubkey!==''&&response.data.api_privkey!==''){
            dispatch(storeDeribitAccount(response.data.api_pubkey, response.data.api_privkey));
            store.set('api_pubkey', response.data.api_pubkey);
            store.set('api_privkey', response.data.api_privkey);
            dispatch(start_saga_ws())
          } else {
            alert("Please provide Deribit api keys");
            history.push('/profile');
          }
        } else {
          // console.log("error getting Deribit keys")
        }
      },
      // error => console.log('An error occurred.', error)
    )
  }
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

export function loginUser(email, password, history) {
  return function(dispatch) {
    dispatch(loginUserRequest());
    return get_token(email, password)
      .then(parseJSON)
      .then(response => {
        try {
          dispatch(loginUserSuccess(response.token));
          // console.log('Login success!!');
          history.push('/');
        } catch (e) {
          alert(e);
          dispatch(
            loginUserFailure({
              response: {
                status: 403,
                statusText: 'Invalid token'
              }
            })
          );
        }
      })
      .catch(error => {
        dispatch(
          loginUserFailure({
            response: {
              status: 403,
              statusText: 'Invalid username or password'
            }
          })
        );
      });
  };
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
    return create_user(email, password)
      .then(parseJSON)
      .then(response => {
        try {
          dispatch(registerUserSuccess(response.token));
          history.push('/analyze');
        } catch (e) {
          dispatch(
            registerUserFailure({
              response: {
                status: 403,
                statusText: 'Invalid token'
              }
            })
          );
        }
      })
      .catch(error => {
        dispatch(
          registerUserFailure({
            response: {
              status: 403,
              statusText: 'User with that email already exists'
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
