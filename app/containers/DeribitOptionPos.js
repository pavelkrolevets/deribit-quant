import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitOptionPos from '../components/Deribit/OptionsPos/index';
import {start_saga_ws, stop_saga_ws} from '../redux/actions/saga_ws'

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    api_pubkey: state.auth.publicKey,
    api_privkey: state.auth.privateKey,
    sagas_channel_run: state.sagas.sagas_channel_run,
    deribit_BTC_index: state.sagas.deribit_BTC_index,
    deribit_BTC_futures_pos: state.sagas.deribit_BTC_futures_pos,
    deribit_BTC_options_pos: state.sagas.deribit_BTC_options_pos,
    deribit_account_state: state.sagas.deribit_account_state,
    deribit_open_pos: state.sagas.deribit_open_pos,
    deribit_btc_all_instruments: state.sagas.deribit_btc_all_instruments
  };
}

const mapDispatchToProps = dispatch => ({
  start_saga_ws: () => dispatch(start_saga_ws()),
  stop_saga_ws: () => dispatch(stop_saga_ws())
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeribitOptionPos);
