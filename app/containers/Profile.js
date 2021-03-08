import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Profile from '../components/User';
import { logoutAndRedirect, storeDeribitAccount } from '../redux/actions/auth';
import { start_saga_ws, stop_saga_ws } from '../redux/actions/saga_ws';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    deribit_auth: state.sagas.deribit_auth,
    isAuthenticated: state.auth.isAuthenticated,
    sagas_channel_run: state.sagas.sagas_channel_run,
  };
}

const mapDispatchToProps = dispatch => ({
  start_saga_ws: () => dispatch(start_saga_ws()),
  stop_saga_ws: () => dispatch(stop_saga_ws()),
  storeDeribitAccount: (pub_key, priv_key)=> dispatch(storeDeribitAccount(pub_key, priv_key)),
  logoutAndRedirect: history => dispatch(logoutAndRedirect(history)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
