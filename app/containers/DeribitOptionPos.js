import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitOptionPos from '../components/Deribit/OptionsPos/index';
import {start_saga_ws, stop_saga_ws} from '../redux/actions/saga_ws'

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    time: state.fetch.data,
    api_pubkey: state.auth.publicKey,
    api_privkey: state.auth.privateKey,
    sagas_channel_run: state.sagas.sagas_channel_run
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
