import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Stat from '../components/Deribit/Statistics';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(mapStateToProps)(Stat);
