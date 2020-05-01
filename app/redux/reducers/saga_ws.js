export const START_CHANNEL = 'START_CHANNEL';
export const STOP_CHANNEL = 'STOP_CHANNEL';
export const WS_DATA = 'WS_DATA';
export const DERIBIT_AUTH = 'DERIBIT_AUTH';
export const DERIBIT_PRIV_SYNC_ON = 'DERIBIT_PRIV_SYNC_ON';
export const DERIBIT_PRIV_SYNC_OFF = 'DERIBIT_PRIV_SYNC_OFF';
export const WS_CONNECTED = 'WS_CONNECTED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';
export const WS_ERROR = 'WS_ERROR';

const initialState = {
  connected: false,
  readyState: null,
  socket: null,
  data: null,
  sagas_channel_run: false,
  deribit_auth: false,
  deribit_priv_sync: false,
  ws_connected: false,
  ws_error: ''
};

export default function saga (state = initialState, action) {
  switch (action.type) {
    case START_CHANNEL:
      return {
        ...state,
        sagas_channel_run: true,
      };

    case STOP_CHANNEL:
      return {
        ...state,
        sagas_channel_run: false,
      };

    case WS_DATA:
      return {
        ...state,
        data: action.data,
      };

    case DERIBIT_AUTH:
      return {
        ...state,
        deribit_auth: true,
      };

    case DERIBIT_PRIV_SYNC_ON:
      return {
        ...state,
        deribit_priv_sync: true,
      };

    case DERIBIT_PRIV_SYNC_OFF:
      return {
        ...state,
        deribit_priv_sync: false,
      };
    case WS_CONNECTED:
      return {
        ...state,
        ws_connected: true,
      };
    case WS_DISCONNECTED:
      return {
        ...state,
        ws_connected: false,
      };

    case WS_ERROR:
      return {
        ...state,
        ws_error: action.error,
      };

    default:
      return state;
  }
}
