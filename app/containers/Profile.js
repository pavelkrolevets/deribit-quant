import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Profile from '../components/User';


function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    deribit_auth: state.sagas.deribit_auth
  };
}

// const mapDispatchToProps = {
//   dispatchKeys: (pk, prk) => saveAccount(pk, prk),
// };

export default connect(
  mapStateToProps,
  // mapDispatchToProps
)(Profile);
