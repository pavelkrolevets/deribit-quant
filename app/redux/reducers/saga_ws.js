export const START_CHANNEL = 'START_CHANNEL';
export const STOP_CHANNEL = 'STOP_CHANNEL';
export const WS_DATA = 'WS_DATA';
export const DERIBIT_AUTH = 'DERIBIT_AUTH';
export const DERIBIT_PRIV_SYNC_ON = 'DERIBIT_PRIV_SYNC_ON';
export const DERIBIT_PRIV_SYNC_OFF = 'DERIBIT_PRIV_SYNC_OFF';
export const WS_CONNECTED = 'WS_CONNECTED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';
export const WS_ERROR = 'WS_ERROR';
export const DERIBIT_BTC_INDEX = 'DERIBIT_BTC_INDEX';
export const DERIBIT_BTC_FUTURES_POS = 'DERIBIT_BTC_FUTURES_POS';
export const DERIBIT_BTC_OPTIONS_POS = 'DERIBIT_BTC_OPTIONS_POS';
export const DERIBIT_ACCOUNT_STATE = 'DERIBIT_ACCOUNT_STATE';
export const DERIBIT_OPEN_POSITIONS = 'DERIBIT_OPEN_POSITIONS';
export const DERIBIT_BTC_ALL_INSTRUMENTS = 'DERIBIT_BTC_ALL_INSTRUMENTS';

const initialState = {
  connected: false,
  readyState: null,
  socket: null,
  data: null,
  sagas_channel_run: false,
  deribit_auth: false,
  deribit_priv_sync: false,
  ws_connected: false,
  ws_error: '',
  deribit_BTC_index: 0,
  deribit_BTC_futures_pos: [],
  deribit_BTC_options_pos: [],
  deribit_account_state: [],
  deribit_open_pos: [],
  deribit_btc_all_instruments: []
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

    case DERIBIT_BTC_INDEX:
      return {
        ...state,
        deribit_BTC_index: action.data.result.edp,
      };

    case DERIBIT_BTC_FUTURES_POS:
      return {
        ...state,
        deribit_BTC_futures_pos: action.data.result,
      };

    case DERIBIT_BTC_OPTIONS_POS:
      return {
        ...state,
        deribit_BTC_options_pos: action.data.result,
      };

    case DERIBIT_ACCOUNT_STATE:
      return {
        ...state,
        deribit_account_state: [action.data.result],
      };

    case DERIBIT_OPEN_POSITIONS:
      return {
        ...state,
        deribit_open_pos: action.data.result,
      };

    case DERIBIT_BTC_ALL_INSTRUMENTS:
      return {
        ...state,
        deribit_btc_all_instruments: action.data.result,
      };

    default:
      return state;
  }
}
