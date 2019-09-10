import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SmartContrLib from '../components/Smart Contracts';
import {saveAccount} from '../actions/account';

function mapStateToProps(state) {
  return {
    email: state.auth.userName
  };
}

const mapDispatchToProps = {
  dispatchKeys: (pk, prk) => saveAccount(pk, prk),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SmartContrLib);
