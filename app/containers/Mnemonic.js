import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Mnemonic from '../components/Wallet/mnemonic/mnemonic';
import {saveAccount} from '../actions/account';

function mapStateToProps(state) {
  return {
    user: state.auth
  };
}

const mapDispatchToProps = {
  dispatchKeys: (pk, prk) => saveAccount(pk, prk),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Mnemonic);
