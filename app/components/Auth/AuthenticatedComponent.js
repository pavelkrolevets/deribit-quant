import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../redux/actions/auth';
import PropTypes from 'prop-types';
const Store = require('electron-store');
const store = new Store();
import { validate_token } from '../../utils/http_functions';
import { error } from 'electron-log';

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    userName: state.auth.userName,
    isAuthenticated: state.auth.isAuthenticated
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

export function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loaded_if_needed: false
      };
    }

    async componentWillMount() {
      this.checkAuth();
    }

    async checkAuth() {
      if (!this.props.isAuthenticated) {
        const token = store.get('token');
        // Check redux state token auth
        if (!token) {
          this.props.history.push('/login');
        }
        // Check electron store token auth to not login each time
        await validate_token(token)
          .then(res => {
            this.props.loginUserSuccess(token);
            this.setState({ loaded_if_needed: true });
          })
          .catch(error => {
            this.props.history.push('/login');
            this.setState({
              loaded_if_needed: false
            });
          });
      } else {
        this.setState({
          loaded_if_needed: true
        });
      }
    }

    render() {
      return (
        <div>
          {this.props.isAuthenticated && this.state.loaded_if_needed ? (
            <Component {...this.props} />
          ) : null}
        </div>
      );
    }
  }

  AuthenticatedComponent.propTypes = {
    loginUserSuccess: PropTypes.func,
    isAuthenticated: PropTypes.bool
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthenticatedComponent);
}
