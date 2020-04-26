import { STORE_DERIBIT_KEYS } from '../actions/account';

const initialState = {
  publicKey: '',
  privateKey: ''
};

export default function account(state = initialState, action) {
  switch (action.type) {
    case STORE_DERIBIT_KEYS:
      return {
        ...state,
        publicKey: action.publicKey,
        privateKey: action.privateKey
      };
    default:
      return state;
  }
}
