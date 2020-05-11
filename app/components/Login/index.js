/* eslint camelcase: 0, no-underscore-dangle: 0 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import RaisedButton from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import * as actionCreators from '../../redux/actions/auth';
import { validateEmail } from '../../utils/misc';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles/index';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    width: window.innerWidth,
    height: window.innerHeight,
  },
  title: {
    color:'#FFF'
  },
  mainText:{
    color:'#FFF',
    marginBottom: 10
  },
  textField:{
    textAlign: "center",
    width: 150,
    minHeight: 50,
    marginLeft: 10,
  },
  filledRoot:{
    '&:hover': {
      backgroundColor: '#FB8D28',
    },
    '&$focused': {
      backgroundColor: '#FB8D28',
    },
    backgroundColor: '#dc6b02',
    '&$input ':{
      color: '#000',
      textAlign: 'center'
    }
  },
  input:{
  },
  focused:{
  },

  filledLabelRoot:{
    '&$focused': {
      color:'red',
    },
    color:'#000'
  },

  button:{
    color:'#FFF',
    backgroundColor: 'red',
    margin: 20
  }
});

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


@connect(
  mapStateToProps,
  mapDispatchToProps
)
class LoginView extends React.Component {
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
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        {/*<Paper style={style}>*/}
          <form role="form">
            <div className="text-center">
              <h1 className={classes.title}>Login to terminal.</h1>
              {this.props.statusText && (
                <div className="alert alert-info">{this.props.statusText}</div>
              )}

              <div>
                <TextField
                  id="outlined-email-input"
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  onChange={e => this.changeValue(e, 'email')}
                  variant="filled"
                  margin="normal"
                  helperText="Please select hedging instrument"
                  InputProps={{
                    classes: {
                      root: classes.filledRoot,
                      input: classes.input,
                      focused: classes.focused
                    },
                  }}
                  InputLabelProps={{
                    classes: {
                      root: classes.filledLabelRoot,
                      focused: classes.focused
                    },
                  }}
                />
              </div>
              <div className="col-md-12">
                <TextField
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  onChange={e => this.changeValue(e, 'password')}
                  variant="filled"
                  margin="normal"
                  helperText="Please select hedging instrument"
                  InputProps={{
                    classes: {
                      root: classes.filledRoot,
                      input: classes.input,
                      focused: classes.focused
                    },
                  }}
                  InputLabelProps={{
                    classes: {
                      root: classes.filledLabelRoot,
                      focused: classes.focused
                    },
                  }}
                />
              </div>

              <RaisedButton
                className={classes.button}
                onClick={e => this.login(e)}
                variant="filled"
              >
                Submit
              </RaisedButton>
            </div>
          </form>
        {/*</Paper>*/}
      </div>
    );
  }
}

LoginView.propTypes = {
  loginUser: PropTypes.func,
  statusText: PropTypes.string,
  initializeSocket: PropTypes.func
};

export default withStyles(styles)(LoginView);
