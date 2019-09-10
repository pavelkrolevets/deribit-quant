import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Deribit from '../components/Deribit/index';
import {saveAccount} from '../actions/account';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

const mapDispatchToProps = {
  dispatchKeys: (pk, prk) => saveAccount(pk, prk),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Deribit);
