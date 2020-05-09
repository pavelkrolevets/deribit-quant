import { connect } from 'react-redux';
import Header from '../components/Header';
import { logoutAndRedirect } from '../redux/actions/auth';
import { deribit_testnet, deribit_realnet } from '../redux/actions/saga_ws';

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    userName: state.auth.userName,
    isAuthenticated: state.auth.isAuthenticated,
    deribit_testnet: state.sagas.deribit_testnet,
    deribit_auth: state.sagas.deribit_auth
  };
}

const mapDispatchToProps = dispatch => ({
  logoutAndRedirect: history => dispatch(logoutAndRedirect(history)),
  set_deribit_testnet: () => dispatch(deribit_testnet()),
  set_deribit_realnet: () => dispatch(deribit_realnet())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
