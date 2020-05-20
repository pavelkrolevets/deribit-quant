import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import * as actionCreators from '../actions/data';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { get_api_keys } from '../../utils/http_functions';
import { withStyles } from '@material-ui/core/styles/index';

function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    isAuthenticated: state.auth.isAuthenticated
  };
}

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    // width: window.innerWidth,
    height: window.innerHeight,
  },

  title: {
    color:'#FFF'
  },
  mainText:{
    color:'#d3d3d3',
    marginBottom: 10
  },
  inputGroup:{
    display: 'inline-block',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'row',
    marginBottom: 10
  },
  textField:{
    textAlign: "center",
    width: 150,
    minHeight: 50,
    marginLeft: 10,
  }
});

// const mapDispatchToProps = dispatch => ({
//   storeDeribitAccount: (api_pubkey, api_privkey) => dispatch(storeDeribitAccount(api_pubkey, api_privkey))
// });

@connect(
  mapStateToProps,
  // mapDispatchToProps
)

class Main extends React.Component {

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        {!this.props.isAuthenticated ? (
          <div>
            <h1  className={classes.title}>
              Welcome to terminal.
            </h1>
            <br/>
            <h4  className={classes.mainText}>
              This is testing version working on Deribit testnet: http://test.deribit.com
            </h4>
            <br/>
            <h4  className={classes.mainText}>
              Please login or register to continue.
            </h4>
          </div>
          )
          :
          (
            <div>
              <h1>
                Welcome {this.props.userName}!
              </h1>
              <br/>
              <br/>
              <h4  className={classes.mainText}>
                Please provide testnet Deribit API keys on Profile page.
              </h4>
            </div>
          )
        }
      </div>
    );
  }
}

Main.propTypes = {
  fetchProtectedData: PropTypes.func,
  loaded: PropTypes.bool,
  userName: PropTypes.string,
  data: PropTypes.any,
  token: PropTypes.string,
  storeDeribitAccount: PropTypes.func,
  email: PropTypes.string,
  user: PropTypes.string,

};

export default withStyles(styles)(Main);
