import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import * as actionCreators from '../actions/data';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { storeDeribitAccount } from '../../actions/account';
import { get_api_keys } from '../../utils/http_functions';
import { initializeSocket } from '../../actions/socket';

function mapStateToProps(state) {
  return {
    data: state.data,
    token: state.auth.token,
    loaded: state.data.loaded,
    isFetching: state.data.isFetching,
    email: state.auth.userName,
    user: state.auth
  };
}
//
// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(actionCreators, dispatch);
// }
const mapDispatchToProps = dispatch => ({
  storeDeribitAccount: (api_pubkey, api_privkey) =>
    dispatch(storeDeribitAccount(api_pubkey, api_privkey))
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class ProtectedView extends React.Component {
  async componentDidMount() {
    console.log(this.props.loaded);
    console.log(this.props.userName);
    console.log(this.props.data);
    await get_api_keys(this.props.user.token, this.props.email).then(result => {
      console.log('Deribit Api Keys', result);
      this.props.storeDeribitAccount(
        result.data.api_pubkey,
        result.data.api_privkey
      );
    });
  }

  render() {
    return (
      <div>
        {!this.props.loaded ? (
          <Paper>
            <h1>Loading data...</h1>
          </Paper>
        ) : (
          <Paper>
            <h1>
              Welcome back,
              {this.props.userName}!
            </h1>
          </Paper>
        )}
      </div>
    );
  }
}

ProtectedView.propTypes = {
  fetchProtectedData: PropTypes.func,
  loaded: PropTypes.bool,
  userName: PropTypes.string,
  data: PropTypes.any,
  token: PropTypes.string,
  storeDeribitAccount: PropTypes.func,
  email: PropTypes.string,
  user: PropTypes.string
};
