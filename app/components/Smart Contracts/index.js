// @flow
import React, { Component } from 'react';



type Props = {};

export default class SmartContracts extends Component<Props> {
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
      <div data-tid="container">
        <h1 style={{color:"#152880"}}>Easy Deployable Smart Contract Library.</h1>
      </div>
    );
  }
}
