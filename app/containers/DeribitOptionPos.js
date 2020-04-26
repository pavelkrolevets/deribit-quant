import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitOptionPos from '../components/Deribit/OptionsPos/index';
import { storeDeribitAccount } from '../actions/account';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

const mapDispatchToProps = {
  dispatchKeys: (pk, prk) => storeDeribitAccount(pk, prk)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeribitOptionPos);
