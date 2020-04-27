// @flow
import React, { Component } from 'react';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
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
    return (
      <div className={styles.container} data-tid="container">
        <h1 style={{ color: '#152880' }}>Welcome to Periscope Terminal!</h1>
      </div>
    );
  }
}
