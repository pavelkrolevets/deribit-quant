import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitDeltaHedger from '../components/Deribit/DeltaHedger/index';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(mapStateToProps)(DeribitDeltaHedger);
