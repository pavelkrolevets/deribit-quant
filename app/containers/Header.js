import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import { initializeSocket } from '../redux/actions/socket.js';
import { logoutAndRedirect } from '../redux/actions/auth';

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
