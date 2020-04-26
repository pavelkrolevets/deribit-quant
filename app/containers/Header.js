import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
// import * as CounterActions from '../actions/counter';
import { initializeSocket } from '../actions/socket.js';
import { logoutAndRedirect } from '../components/actions/auth';

function mapStateToProps(state) {
  return {
    socket: state.socket,
    token: state.auth.token,
    userName: state.auth.userName,
    isAuthenticated: state.auth.isAuthenticated
  };
}

const mapDispatchToProps = dispatch => ({
  initializeSocket: () => dispatch(initializeSocket()),
  logoutAndRedirect: history => dispatch(logoutAndRedirect(history))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
