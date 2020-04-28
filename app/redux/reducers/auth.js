import jwtDecode from 'jwt-decode';

import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAILURE,
    LOGIN_USER_REQUEST,
    LOGOUT_USER,
    REGISTER_USER_FAILURE,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    STORE_DERIBIT_KEYS} from '../constants';

const initialState = {
    token: null,
    userName: null,
    isAuthenticated: false,
    isAuthenticating: false,
    statusText: null,
    isRegistering: false,
    isRegistered: false,
    registerStatusText: null,
    publicKey: '',
    privateKey: ''
};

export default function Auth (state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
      return {
        ...state,
        isAuthenticating: true,
        statusText: null,
      };
    case LOGIN_USER_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: true,
        token: action.payload.token,
        userName: jwtDecode(action.payload.token).email,
        statusText: 'You have been successfully logged in.',
      };
    case LOGIN_USER_FAILURE:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: `Authentication Error: ${action.payload.status} ${action.payload.statusText}`,
      };
    case LOGOUT_USER:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        userName: null,
        statusText: 'You have been successfully logged out.',
      };
    case REGISTER_USER_SUCCESS:
      return {
        ...state,
        isAuthenticating: false,
        isAuthenticated: true,
        isRegistering: false,
        token: action.payload.token,
        userName: jwtDecode(action.payload.token).email,
        registerStatusText: 'You have been successfully logged in.',
      };
    case REGISTER_USER_REQUEST:
      return {
        ...state,
        isRegistering: true,
      };
    case REGISTER_USER_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        userName: null,
        registerStatusText: `Register Error: ${action.payload.status} ${action.payload.statusText}`,
      };
    case STORE_DERIBIT_KEYS:
      return {
        ...state,
        api_pubkey: action.api_pubkey,
        api_privkey: action.api_privkey
      };
    default:
      return state;

  }
};
