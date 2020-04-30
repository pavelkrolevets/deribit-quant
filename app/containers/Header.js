import { connect } from 'react-redux';
import Header from '../components/Header';
import { logoutAndRedirect } from '../redux/actions/auth';

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    userName: state.auth.userName,
    isAuthenticated: state.auth.isAuthenticated
  };
}

const mapDispatchToProps = dispatch => ({
  logoutAndRedirect: history => dispatch(logoutAndRedirect(history))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
