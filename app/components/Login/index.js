/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import RaisedButton from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import * as actionCreators from '../actions/auth';
import { validateEmail } from '../../utils/misc';
import PropTypes from 'prop-types';
import { initializeSocket } from '../../actions/socket.js';
import { getDeribitAccount } from '../../actions/account.js';

function mapStateToProps(state) {
  return {
    isAuthenticating: state.auth.isAuthenticating,
    statusText: state.auth.statusText,
    email: state.auth.userName,
    user: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const style = {
  marginTop: 50,
  paddingBottom: 50,
  paddingTop: 25,
  width: '100%',
  textAlign: 'center',
  display: 'inline-block'
};

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    const redirectRoute = '/login';
    this.state = {
      email: '',
      password: '',
      email_error_text: null,
      password_error_text: null,
      redirectTo: redirectRoute,
      disabled: true
    };
  }

  isDisabled() {
    let email_is_valid = false;
    let password_is_valid = false;

    if (this.state.email === '') {
      this.setState({
        email_error_text: null
      });
    } else if (validateEmail(this.state.email)) {
      email_is_valid = true;
      this.setState({
        email_error_text: null
      });
    } else {
      this.setState({
        email_error_text: 'Sorry, this is not a valid email'
      });
    }

    if (this.state.password === '' || !this.state.password) {
      this.setState({
        password_error_text: null
      });
    } else if (this.state.password.length >= 6) {
      password_is_valid = true;
      this.setState({
        password_error_text: null
      });
    } else {
      this.setState({
        password_error_text: 'Your password must be at least 6 characters'
      });
    }

    if (email_is_valid && password_is_valid) {
      this.setState({
        disabled: false
      });
    }
  }

  changeValue(e, type) {
    const value = e.target.value;
    const next_state = {};
    next_state[type] = value;
    this.setState(next_state, () => {
      this.isDisabled();
    });
  }

  login(e) {
    e.preventDefault();
    this.props.loginUser(
      this.state.email,
      this.state.password,
      this.props.history
    );
  }

  render() {
    return (
      <div className="col-md-6 col-md-offset-3">
        <Paper style={style}>
          <form role="form">
            <div className="text-center">
              <h1>Login to options trader!</h1>
              {this.props.statusText && (
                <div className="alert alert-info">{this.props.statusText}</div>
              )}

              <div className="col-md-12">
                <TextField
                  id="outlined-email-input"
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  margin="normal"
                  variant="outlined"
                  onChange={e => this.changeValue(e, 'email')}
                />
              </div>
              <div className="col-md-12">
                <TextField
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  variant="outlined"
                  onChange={e => this.changeValue(e, 'password')}
                />
              </div>

              <RaisedButton
                style={{ marginTop: 50 }}
                onClick={e => this.login(e)}
                variant="contained"
                color="primary"
              >
                Submit
              </RaisedButton>
            </div>
          </form>
        </Paper>
      </div>
    );
  }
}

LoginView.propTypes = {
  loginUser: PropTypes.func,
  statusText: PropTypes.string,
  initializeSocket: PropTypes.func
};
