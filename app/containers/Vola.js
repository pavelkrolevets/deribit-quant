import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Vola from '../components/Deribit/Vola/index';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(mapStateToProps)(Vola);
