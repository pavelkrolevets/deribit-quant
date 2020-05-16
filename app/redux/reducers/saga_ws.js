export const START_CHANNEL = 'START_CHANNEL';
export const STOP_CHANNEL = 'STOP_CHANNEL';
export const WS_DATA = 'WS_DATA';
export const DERIBIT_AUTH = 'DERIBIT_AUTH';
export const DERIBIT_AUTH_ERROR = 'DERIBIT_AUTH_ERROR';
export const DERIBIT_PRIV_SYNC_ON = 'DERIBIT_PRIV_SYNC_ON';
export const DERIBIT_PRIV_SYNC_OFF = 'DERIBIT_PRIV_SYNC_OFF';
export const WS_CONNECTED = 'WS_CONNECTED';
export const WS_DISCONNECTED = 'WS_DISCONNECTED';
export const WS_ERROR = 'WS_ERROR';
export const DERIBIT_BTC_INDEX = 'DERIBIT_BTC_INDEX';
export const DERIBIT_BTC_FUTURES_POS = 'DERIBIT_BTC_FUTURES_POS';
export const DERIBIT_BTC_OPTIONS_POS = 'DERIBIT_BTC_OPTIONS_POS';
export const DERIBIT_BTC_ACCOUNT_STATE = 'DERIBIT_BTC_ACCOUNT_STATE';
export const DERIBIT_BTC_OPEN_POSITIONS = 'DERIBIT_BTC_OPEN_POSITIONS';
export const DERIBIT_BTC_ALL_INSTRUMENTS = 'DERIBIT_BTC_ALL_INSTRUMENTS';
export const DERIBIT_ETH_INDEX = 'DERIBIT_ETH_INDEX';
export const DERIBIT_ETH_ACCOUNT_STATE = 'DERIBIT_ETH_ACCOUNT_STATE';
export const DERIBIT_ETH_OPEN_POSITIONS = 'DERIBIT_ETH_OPEN_POSITIONS';
export const DERIBIT_ETH_ALL_INSTRUMENTS = 'DERIBIT_ETH_ALL_INSTRUMENTS';
export const DERIBIT_TRADINGVIEW_DATA = 'DERIBIT_TRADINGVIEW_DATA';
export const DERIBIT_TRADINGVIEW_DATA_RESOLUTION = 'DERIBIT_TRADINGVIEW_DATA_RESOLUTION';

export const DERIBIT_API_TESTNET = 'DERIBIT_API_TESTNET';
export const DERIBIT_API_REALNET = 'DERIBIT_API_REALNET';

const initialState = {
  deribit_api_url: 'wss://test.deribit.com/ws/api/v2/',
  deribit_testnet: true,
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
  deribit_BTC_account_state: [],
  deribit_BTC_open_pos: [],
  deribit_BTC_all_instruments: [],

  deribit_ETH_index: 0,
  deribit_ETH_account_state: [],
  deribit_ETH_open_pos: [],
  deribit_ETH_all_instruments: [],

  derbit_tradingview_data: [],
  derbit_tradingview_resolution: "30",
  derbit_tradingview_instrument_name: "BTC-26JUN20",
  derbit_tradingview_start_timestamp: 1554373800000,
  derbit_tradingview_end_timestamp: 1554373800000,
};

export default function saga(state = initialState, action) {
  switch (action.type) {
    case START_CHANNEL:
      return {
        ...state,
        sagas_channel_run: true
      };

    case STOP_CHANNEL:
      return {
        ...state,
        sagas_channel_run: false
      };

    case WS_DATA:
      return {
        ...state,
        data: action.data
      };

    case DERIBIT_AUTH:
      return {
        ...state,
        deribit_auth: true
      };

    case DERIBIT_AUTH_ERROR:
      return {
        ...state,
        deribit_auth: false
      };

    case DERIBIT_PRIV_SYNC_ON:
      return {
        ...state,
        deribit_priv_sync: true
      };

    case DERIBIT_PRIV_SYNC_OFF:
      return {
        ...state,
        deribit_priv_sync: false
      };
    case WS_CONNECTED:
      return {
        ...state,
        ws_connected: true
      };
    case WS_DISCONNECTED:
      return {
        ...state,
        ws_connected: false
      };

    case WS_ERROR:
      return {
        ...state,
        ws_error: action.error
      };

    case DERIBIT_BTC_INDEX:
      return {
        ...state,
        deribit_BTC_index: action.data.result.edp
      };

    case DERIBIT_BTC_FUTURES_POS:
      return {
        ...state,
        deribit_BTC_futures_pos: action.data.result
      };

    case DERIBIT_BTC_OPTIONS_POS:
      return {
        ...state,
        deribit_BTC_options_pos: action.data.result
      };

    case DERIBIT_BTC_ACCOUNT_STATE:
      return {
        ...state,
        deribit_BTC_account_state: [action.data.result]
      };

    case DERIBIT_BTC_OPEN_POSITIONS:
      return {
        ...state,
        deribit_BTC_open_pos: action.data.result
      };

    case DERIBIT_BTC_ALL_INSTRUMENTS:
      return {
        ...state,
        deribit_BTC_all_instruments: action.data.result
      };

    case DERIBIT_API_TESTNET:
      return {
        ...state,
        deribit_testnet: true,
        deribit_api_url: 'wss://test.deribit.com/ws/api/v2/'
      };

    case DERIBIT_API_REALNET:
      return {
        ...state,
        deribit_testnet: false,
        deribit_api_url: 'wss://www.deribit.com/ws/api/v2/'
      };

    case DERIBIT_ETH_INDEX:
      return {
        ...state,
        deribit_ETH_index: action.data.result.edp
      };

    case DERIBIT_ETH_ACCOUNT_STATE:
      return {
        ...state,
        deribit_ETH_account_state: [action.data.result]
      };

    case DERIBIT_ETH_OPEN_POSITIONS:
      return {
        ...state,
        deribit_ETH_open_pos: action.data.result
      };

    case DERIBIT_ETH_ALL_INSTRUMENTS:
      return {
        ...state,
        deribit_ETH_all_instruments: action.data.result
      };

    case DERIBIT_TRADINGVIEW_DATA:
      return {
        ...state,
        derbit_tradingview_data: action.data.result
      };

    default:
      return state;
  }
}
