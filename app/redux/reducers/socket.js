import {
  SOCKET_CONNECTION_INIT,
  SOCKET_CONNECTION_SUCESS,
  SOCKET_CONNECTION_ERROR,
  SOCKET_CONNECTION_CLOSED,
  SOCKET_MESSAGE
} from '../actions/socket';

const initialState = {
  connected: false,
  readyState: null,
  socket: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SOCKET_CONNECTION_INIT:
      return Object.assign({}, state, {
        connected: false,
        socket: action.socket
      });

    case SOCKET_CONNECTION_SUCESS:
      return Object.assign({}, state, {
        connected: true
      });

    case SOCKET_CONNECTION_ERROR:
      return Object.assign({}, state, {
        connected: false
      });

    case SOCKET_CONNECTION_CLOSED:
      return Object.assign({}, state, {
        connected: false,
        socket: null
      });

    case SOCKET_MESSAGE:
      // Do your logic here with action.data
      // example handleIncomingMessage(action.data)
      return state;

    default:
      return state;
  }
}
