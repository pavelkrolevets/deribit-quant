import {
  STOP_CHANNEL,
  START_CHANNEL, WS_DATA
} from '../constants/index';

const initialState = {
  connected: false,
  readyState: null,
  socket: null,
  data: null,
  sagas_channel_run: null
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

    default:
      return state;
  }
}
