import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Anailze from '../components/Deribit/Analize';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

export default connect(mapStateToProps)(Anailze);
