import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitDeltaHedger from '../components/Deribit/DeltaHedger/index';
import {saveAccount} from '../actions/account';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(
  mapStateToProps,
)(DeribitDeltaHedger);
