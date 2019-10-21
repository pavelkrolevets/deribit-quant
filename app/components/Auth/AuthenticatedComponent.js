import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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


export function requireAuthentication(Component) {
    class AuthenticatedComponent extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          loaded_if_needed: false,
        };
      }

      componentWillMount() {
            this.checkAuth();
        }


        checkAuth() {
            if (!this.props.isAuthenticated) {
                const token = store.get('token');
                console.log("User token", token);
                if (!token) {
                  this.props.history.push('/login');
                } else {
                  validate_token(token)
                        .then(res => {
                            if (res.status === 200) {
                                this.props.loginUserSuccess(token);
                                this.setState({
                                    loaded_if_needed: true,
                                });

                            } else {
                              this.props.history.push('/analyze');

                            }
                        });

                }
            } else {
                this.setState({
                    loaded_if_needed: true,
                });
            }
        }

        render() {
            return (
                <div>
                    {this.props.isAuthenticated && this.state.loaded_if_needed
                        ? <Component {...this.props} />
                        : null
                    }
                </div>
            );

        }
    }

    AuthenticatedComponent.propTypes = {
        loginUserSuccess: PropTypes.func,
        isAuthenticated: PropTypes.bool,
    };

    return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);
}
