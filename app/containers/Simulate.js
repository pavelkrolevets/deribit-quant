import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Simulate from '../components/Deribit/Simulate';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(mapStateToProps)(Simulate);
