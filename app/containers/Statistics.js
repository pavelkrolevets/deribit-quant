import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Stat from '../components/Deribit/Statistics';
import {saveAccount} from '../actions/account';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(
  mapStateToProps,
)(Stat);
