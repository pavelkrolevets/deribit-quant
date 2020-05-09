// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';

type Props = {};

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    width: window.innerWidth,
    height: window.innerHeight
  },
  title: {
    color: '#000'
  },
  mainText: {
    color: '#000',
    marginBottom: 10
  },
  textField: {
    textAlign: 'center',
    width: 150,
    minHeight: 50,
    marginLeft: 10
  }
});

class Home extends Component<Props> {
  props: Props;

  // async componentWillMount(){
  //   this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
  //   this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
  //   this.web3.eth.getAccounts(function (error, res) {
  //     if (!error) {
  //       console.log(res);
  //     } else {
  //       console.log(error);
  //     }
  //   });
  // }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <h1 className={classes.title}>Welcome!</h1>

        <h4 className={classes.mainText}>
          {' '}
          DISCLAIMER: this service is not intended to be investment advice. Seek
          a duly licensed professional for investment advice.{' '}
        </h4>
      </div>
    );
  }
}

export default withStyles(styles)(Home);
