import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import * as actionCreators from '../actions/auth';
import PropTypes from 'prop-types';
const Store = require('electron-store');
const store = new Store();
import { validate_token } from '../../utils/http_functions';

function mapStateToProps(state) {
    return {
        token: state.auth.token,
        userName: state.auth.userName,
        isAuthenticated: state.auth.isAuthenticated,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}


export function requireNoAuthentication(Component) {

    class notAuthenticatedComponent extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                loaded: false,
            };
        }

        componentWillMount() {
            this.checkAuth();
        }

        checkAuth() {
            if (this.props.isAuthenticated) {
                this.props.history.push('/main');

            } else {
                const token = store.get('token');
                console.log("token", token);
                if (token) {
                  validate_token(token)
                        .then(res => {
                          console.log("Response", res);
                            if (res.status === 200) {
                                this.props.loginUserSuccess(token);
                                this.props.history.push('/main');

                            } else {
                              this.props.history.push('/login');
                                this.setState({
                                    loaded: true,
                                });
                            }
                        })
                        .catch(error => {
                          console.log(error.response);
                          this.props.history.push('/login');
                          this.setState({
                            loaded: true,
                          });
                        });
                } else {
                  this.props.history.push('/login');
                    this.setState({
                        loaded: true,
                    });
                }
            }
        }

        render() {
            return (
                <div>
                    {!this.props.isAuthenticated && this.state.loaded
                        ? <Component {...this.props} />
                        : null
                    }
                </div>
            );

        }
    }

    notAuthenticatedComponent.propTypes = {
        loginUserSuccess: PropTypes.func,
        isAuthenticated: PropTypes.bool,
    };

    return connect(mapStateToProps, mapDispatchToProps)(notAuthenticatedComponent);

}
