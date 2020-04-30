import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import * as actionCreators from '../actions/data';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { get_api_keys } from '../../utils/http_functions';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth
  };
}

// const mapDispatchToProps = dispatch => ({
//   storeDeribitAccount: (api_pubkey, api_privkey) => dispatch(storeDeribitAccount(api_pubkey, api_privkey))
// });

@connect(
  mapStateToProps,
  // mapDispatchToProps
)
export default class ProtectedView extends React.Component {
  async componentDidMount() {
  }

  render() {
    return (
      <div>
        {/*{!this.props.loaded ? (*/}
        {/*  <Paper>*/}
        {/*    <h1>Loading data...</h1>*/}
        {/*  </Paper>*/}
        {/*) : (*/}
          <Paper>
            <h1>
              Welcome back, {this.props.userName}!
            </h1>
          </Paper>
        {/*)}*/}
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
