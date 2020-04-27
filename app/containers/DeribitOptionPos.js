import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeribitOptionPos from '../components/Deribit/OptionsPos/index';
import {fetchSaga} from '../saga/saga';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    time: state.fetch.data,
    api_pubkey: state.auth.publicKey,
    api_privkey: state.auth.privateKey
  };
}

const mapDispatchToProps = dispatch => ({
  getTime: () => dispatch(fetchSaga())
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeribitOptionPos);
