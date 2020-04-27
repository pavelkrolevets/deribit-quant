export const SOCKET_CONNECTION_INIT = 'SOCKET_CONNECTION_INIT';
export const SOCKET_CONNECTION_SUCESS = 'SOCKET_CONNECTION_SUCCESS';
export const SOCKET_CONNECTION_ERROR = 'SOCKET_CONNECTION_ERROR';
export const SOCKET_CONNECTION_CLOSED = 'SOCKET_CONNECTION_CLOSED';
export const SOCKET_MESSAGE = 'SOCKET_MESSAGE';

export function initializeSocket() {
  return dispatch => {
    const socket = new WebSocket('wss://www.deribit.com/ws/api/v2/');
    dispatch(socketConnectionInit(socket));

    socket.onopen = function() {
      dispatch(socketConnectionSuccess());
    };

    socket.onerror = function() {
      dispatch(socketConnectionError());
    };

    socket.onmessage = function(event) {
      dispatch(socketMessage(event.data));
    };

    socket.onclose = function() {
      dispatch(socketConnectionClosed());
    };
  };
}

function socketConnectionInit(socket) {
  return {
    type: SOCKET_CONNECTION_INIT,
    socket
  };
}

function socketConnectionSuccess() {
  return {
    type: SOCKET_CONNECTION_SUCESS
  };
}

function socketConnectionError() {
  return {
    type: SOCKET_CONNECTION_ERROR
  };
}

function socketConnectionClosed() {
  return {
    type: SOCKET_CONNECTION_CLOSED
  };
}

function socketMessage(data) {
  return {
    type: SOCKET_MESSAGE,
    data
  };
}
