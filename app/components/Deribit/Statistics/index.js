// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Crosshair,
  MarkSeries,
  LabelSeries
} from 'react-vis';
import {
  compute_bsm,
  get_api_keys,
  compute_pnl,
  get_btc_contango,
  get_eth_contango
} from '../../../utils/http_functions';
import { typeOfNode } from 'enzyme/src/Utils';

const styles = theme => ({
  root: {
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  chart: {},
  elementPadding: {
    padding: '20px'
  }
});

const deribit_http = 'https://www.deribit.com';

class Stat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current: [],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      keys: {},
      positions: [],
      indexBtc: 0,
      indexEth: 0,
      account: [],
      time: new Date().toLocaleTimeString(),
      range_min: '',
      range_max: '',
      step: '',
      risk_free: '',
      vola: '',
      zoom: 1.2,
      instrument: '',
      instruments: [],
      instrumentData: new Object(),
      bids: [],
      asks: [],
      instrumentAskIv: '',
      instrumentBidIv: '',
      instrumentDelta: '',
      instrumentLastPrice: '',
      underlying_currency: 'BTC',
      expiration_list: [
        { id: 100, strike: '31DEC19' },
        { id: 101, strike: '27MAR202' },
        { id: 102, strike: '31JAN202' }
      ],
      underlying_srike: '',
      strike_list: [
        { id: 100, strike: '1000' },
        { id: 101, strike: '2000' },
        { id: 102, strike: '3000' },
        { id: 103, strike: '4000' },
        { id: 104, strike: '5000' },
        { id: 105, strike: '6000' },
        { id: 106, strike: '7000' },
        { id: 107, strike: '8000' },
        { id: 108, strike: '9000' },
        { id: 109, strike: '10000' },
        { id: 110, strike: '11000' },
        { id: 111, strike: '12000' },
        { id: 112, strike: '13000' },
        { id: 113, strike: '14000' },
        { id: 114, strike: '15000' },
        { id: 115, strike: '16000' },
        { id: 116, strike: '17000' },
        { id: 117, strike: '18000' },
        { id: 118, strike: '19000' },
        { id: 119, strike: '20000' }
      ],
      underlying_expiration: '',
      ws_close: false,
      btc_3_months_contango: [],
      btc_6_months_contango: [],
      eth_3_months_contango: [],
      eth_6_months_contango: []
    };
  }

  async componentWillMount() {
    let token = this.props.user.token;
    let email = this.props.email;
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(
        get_api_keys(token, email).then(result => {
          // console.log("Result ",result);
          that.setState({ keys: result.data });
          return null;
        })
      );
    }).then(function(result) {
      return new Promise(function(resolve, reject) {
        resolve(that.updateData());
      });
    });
  }
  componentWillUnmount() {
    let that = this;
    setTimeout(function() {
      this.ws_unsubscribe();
    }, 1000);
  }

  async componentDidMount() {
    let that = this;
    setTimeout(
      function() {
        this.getWebsocketsData();
      }.bind(this),
      2000
    );

    setInterval(
      function() {
        this.computeReturns();
      }.bind(this),
      5000
    );

    setInterval(
      function() {
        this.getBtcFuturesContango();
        this.getEthFuturesContango();
      }.bind(this),
      5000
    );
  }

  async updateData() {
    let that = this;
    let RestClient = await require('deribit-api').RestClient;
    let restClient = await new RestClient(
      this.state.keys.api_pubkey,
      this.state.keys.api_privkey,
      deribit_http
    );

    restClient
      .index()
      .then(result => {
        // console.log("Index: ", result);
        that.setState({ index: result.result.btc });
        return result;
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
          restClient.getinstruments(result => {
            // console.log("Instruments: ", result);
            let instruments = result.result.sort((a, b) =>
              a['kind'] > b['kind'] ? 1 : -1
            );

            let futures = [];
            for (let item of instruments) {
              if (item.kind == 'future') {
                futures.push({
                  instrumentName: item.instrumentName,
                  expiration: item.expiration
                });
              }
            }
            // console.log("Instruments: ", futures);
            that.setState({ instruments: futures });
            resolve(instruments);
          });
        });
      })
      .then(result => {
        that.getExpirations(result.result);
      });
  }

  getExpirations(instruments) {
    const unique = [...new Set(instruments.map(item => item.expiration))];
    let result = [];
    const monthNames = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC'
    ];
    for (let item of unique) {
      // if (item !== "3000-01-01 08:00:00 GMT"){
      // let formatted_date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
      var date = new Date(item);
      let exp =
        date.getDate().toString() +
        monthNames[date.getMonth()] +
        date
          .getFullYear()
          .toString()
          .substring(2, 4);
      // let jsonString = new Object();
      // jsonString[exp] = "";
      // JSON.stringify(jsonString);
      result.push(exp);
      // }
    }
    // result.sort((a,b)=>a.getTime()-b.getTime());
    // console.log("Result:  ", result);
    this.setState({ expiration_list: result });
    console.log('Expirations', result);
  }

  handleChange = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
  };

  handleChangeCurrency = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
    if (event.target.value === 'BTC') {
      this.setState({
        strike_list: [
          { id: 100, strike: '1000' },
          { id: 101, strike: '2000' },
          { id: 102, strike: '3000' },
          { id: 103, strike: '4000' },
          { id: 104, strike: '5000' },
          { id: 105, strike: '6000' },
          { id: 106, strike: '7000' },
          { id: 107, strike: '8000' },
          { id: 108, strike: '9000' },
          { id: 109, strike: '10000' },
          { id: 110, strike: '11000' },
          { id: 111, strike: '12000' },
          { id: 112, strike: '13000' },
          { id: 113, strike: '14000' },
          { id: 114, strike: '15000' },
          { id: 115, strike: '16000' },
          { id: 116, strike: '17000' },
          { id: 117, strike: '18000' },
          { id: 118, strike: '19000' },
          { id: 119, strike: '20000' }
        ]
      });
    }
    if (event.target.value === 'ETH') {
      this.setState({
        strike_list: [
          { id: 100, strike: '100' },
          { id: 101, strike: '200' },
          { id: 102, strike: '300' },
          { id: 103, strike: '400' },
          { id: 104, strike: '500' },
          { id: 105, strike: '600' },
          { id: 106, strike: '700' },
          { id: 107, strike: '800' },
          { id: 108, strike: '900' },
          { id: 109, strike: '1000' },
          { id: 110, strike: '1100' },
          { id: 111, strike: '1200' },
          { id: 112, strike: '1300' },
          { id: 113, strike: '1400' },
          { id: 114, strike: '1500' },
          { id: 115, strike: '1600' },
          { id: 116, strike: '1700' },
          { id: 117, strike: '1800' },
          { id: 118, strike: '1900' },
          { id: 119, strike: '2000' }
        ]
      });
    }
  };

  getWebsocketsData() {
    let that = this;
    return new Promise(function(resolve, reject) {
      let RestClient = require('deribit-api').RestClient;
      let restClient = new RestClient(
        that.state.keys.api_pubkey,
        that.state.keys.api_privkey,
        deribit_http
      );

      const WebSocket = require('ws');
      const ws = new WebSocket('wss://www.deribit.com/ws/api/v1/');

      ws.on('open', function open() {
        var args = {
          instrument: ['futures'],
          event: ['order_book']
        };
        var obj = {
          id: 5230,
          action: '/api/v1/private/subscribe',
          arguments: args,
          sig: restClient.generateSignature('/api/v1/private/subscribe', args)
        };
        // console.log('Request object', obj);
        resolve(ws.send(JSON.stringify(obj)));
      });

      ws.on('message', function incoming(data) {
        // console.log('on message');
        if (data.length > 0) {
          var obj = JSON.parse(data);
          // console.log("Data ", obj.notifications);

          if (typeof obj.notifications !== 'undefined') {
            that.setState({
              ['ws_' + obj.notifications[0].result.instrument]: obj
            });
          }
        }
      });
    });
  }

  computeReturns() {
    // console.log("Hello");
    for (let item of this.state.instruments) {
      // console.log("Hello", this.state["ws_"+item.instrumentName]);
      if (typeof this.state['ws_' + item.instrumentName] !== 'undefined') {
        if (
          item.instrumentName !== 'BTC-PERPETUAL' &&
          item.instrumentName.substring(0, 3) === 'BTC'
        ) {
          const diffTime = Math.abs(
            new Date(item.expiration).getTime() - Date.now()
          );
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let fut_ret =
            (parseInt(this.state[item.instrumentName]) /
              parseInt(this.state['BTC-PERPETUAL']) -
              1) *
            (365 / diffDays) *
            100;
          let new_item = 'RET-' + item.instrumentName.toString();
          this.setState({ [new_item]: fut_ret.toFixed(2) });
          this.setState({
            [item.instrumentName]: this.state[
              'ws_' + item.instrumentName
            ].notifications[0].result.last.toFixed(2)
          });
          // that.setState()
          // console.log("Instrument ", this.state[item.instrumentName], " last ", this.state["ws_" + item.instrumentName].notifications[0].result.last, "Return", this.state[new_item]);
        } else if (
          item.instrumentName !== 'ETH-PERPETUAL' &&
          item.instrumentName.substring(0, 3) === 'ETH'
        ) {
          const diffTime = Math.abs(
            new Date(item.expiration).getTime() - Date.now()
          );
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          let fut_ret =
            (parseInt(this.state[item.instrumentName]) /
              parseInt(this.state['ETH-PERPETUAL']) -
              1) *
            (365 / diffDays) *
            100;
          let new_item = 'RET-' + item.instrumentName.toString();
          this.setState({ [new_item]: fut_ret.toFixed(2) });
          this.setState({
            [item.instrumentName]: this.state[
              'ws_' + item.instrumentName
            ].notifications[0].result.last.toFixed(2)
          });
          // console.log("Instrument ", this.state[item.instrumentName], " last ", this.state["ws_" + item.instrumentName].notifications[0].result.last, "Return", this.state[new_item]);
        } else {
          let new_item = 'RET-' + item.toString();
          this.setState({ [new_item]: (0).toFixed(2) });
          this.setState({
            [item.instrumentName]: this.state['ws_' + item.instrumentName]
              .notifications[0].result.last
          });
        }

        this.getChartFromInstruments();
      }
    }
  }

  getChartFromInstruments() {
    let chartBTC = [];
    let chartETH = [];
    for (let item of this.state.instruments) {
      let date = new Date();

      if (
        item.instrumentName === 'BTC-PERPETUAL' ||
        item.instrumentName === 'ETH-PERPETUAL'
      ) {
        date = Date.now();
      } else {
        date = new Date(item.expiration);
      }

      if (item.instrumentName.substring(0, 3) === 'BTC') {
        chartBTC.push({
          x: date,
          y: parseInt(this.state[item.instrumentName]),
          label: item.instrumentName,
          style: { fontSize: 8 }
        });
      }
      if (item.instrumentName.substring(0, 3) === 'ETH') {
        chartETH.push({
          x: date,
          y: parseInt(this.state[item.instrumentName]),
          label: item.instrumentName,
          style: { fontSize: 8, textAnchor: 'middle' },
          color: '#dc6b02'
        });
      }
    }
    chartETH.sort((a, b) => {
      if (typeof a.x !== 'undefined' && typeof b.x !== 'undefined') {
        return a.x - b.x;
      }
    });

    chartBTC.sort((a, b) => {
      if (typeof a.x !== 'undefined' && typeof b.x !== 'undefined') {
        return a.x - b.x;
      }
    });
    this.setState({ chartETH: chartETH });
    this.setState({ chartBTC: chartBTC });
    // console.log("Chart data", chartBTC, chartETH);
  }

  ws_unsubscribe() {
    this.setState({ ...this.state, ws_close: true });
  }

  // async plot(){
  //   let pos = this.state.positions[0];
  //
  //   await this.computeBSM(parseInt(pos.averageUsdPrice), 0.3, this.getStrike(pos.instrument), 0.7, 'call', 'sell')
  //     .then(result=>this.State({chart_data_current: result}));
  //   await this.computeBSM(parseInt(pos.averageUsdPrice), 0.00001, this.getStrike(pos.instrument), 0.7, 'call', 'sell')
  //     .then(result=>this.setState({chart_data_at_zero: result}));
  // }

  // async computeBSM (trade_price, T, strike, vola, option_type, direction) {
  //   let data = [];
  //   let S0 = [];
  //   let chart_data=[];
  //
  //   for (let i= parseInt(strike)-10000; i < parseInt(strike)+10000; i +=1000){
  //     data.push(JSON.stringify({S0: i, K:parseInt(strike), T:T, r: 0.03, sigma: vola}));
  //     S0.push(i)
  //   }
  //   console.log(data);
  //   await compute_bsm(this.props.user.token, option_type, data, direction, trade_price)
  //     .then(response=> {console.log(response);
  //       this.setState({option_values: response.data.option_values });
  //     });
  //
  //   let y_range = [];
  //   for (let i=0; i<S0.length; i++) {
  //     chart_data.push({x: S0[i], y: (this.state.option_values[i])});
  //     y_range.push((this.state.option_values[i]-trade_price))
  //   }
  //   this.setState({yDomain: [Math.min(...y_range)-1000, Math.max(...y_range)+1000]});
  //
  //   return chart_data;
  // }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.state.chart_data_current[index]] });
  };

  async get_open_positions() {
    function calculate(item, index, arr) {
      // console.log(item);
      // console.log(index);
    }
    this.state.positions.forEach(calculate);
  }

  zoomIn() {
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(
        that.setState((prevState, props) => ({ zoom: prevState.zoom + 0.2 }))
      );
      return null;
    });
    promise.then(() => this.computePnL());
  }
  zoomOut() {
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(
        that.setState((prevState, props) => ({ zoom: prevState.zoom - 0.2 }))
      );
      return null;
    });
    promise.then(() => this.computePnL());
  }

  getBtcFuturesContango() {
    let that = this;
    get_btc_contango(this.props.user.token).then(data => {
      // console.log("BTC futures", data);
      let btc_3_months_contango = [];
      let btc_6_months_contango = [];

      for (let i of data.data.json_list) {
        let diff_3_month = parseInt(i.three_months) - parseInt(i.perpetual);
        let diff_6_month = parseInt(i.six_months) - parseInt(i.perpetual);
        let date = new Date(i.timestamp);
        btc_3_months_contango.push({ x: date, y: parseInt(diff_3_month) });
        btc_6_months_contango.push({ x: date, y: parseInt(diff_6_month) });
      }
      that.setState({ btc_3_months_contango: btc_3_months_contango });
      that.setState({ btc_6_months_contango: btc_6_months_contango });
    });
  }

  getEthFuturesContango() {
    let that = this;
    get_eth_contango(this.props.user.token).then(data => {
      // console.log("ETH futures", data);
      let eth_3_months_contango = [];
      let eth_6_months_contango = [];
      for (let i of data.data.json_list) {
        let diff_3_month = parseInt(i.three_months) - parseInt(i.perpetual);
        let diff_6_month = parseInt(i.six_months) - parseInt(i.perpetual);
        let date = new Date(i.timestamp);
        eth_3_months_contango.push({ x: date, y: parseInt(diff_3_month) });
        eth_6_months_contango.push({ x: date, y: parseInt(diff_6_month) });
      }
      that.setState({ eth_3_months_contango: eth_3_months_contango });
      that.setState({ eth_6_months_contango: eth_6_months_contango });
    });
  }

  render() {
    const { classes } = this.props;
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let { yDomain } = this.state;
    let { instrument } = this.state;
    let { strike_list, expiration_list } = this.state;
    let that = this;
    function comp_ret(that, row) {
      if (typeof that.state[row] !== 'undefined') {
        let result = that.state[row];
        // console.log("Result ...",result);
        return result.ret;
      } else {
        return 0;
      }
    }
    return (
      <div
        data-tid="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'black'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          {/*<h5*/}
          {/*  style={{*/}
          {/*    color: '#dc6b02',*/}
          {/*    display: 'flex',*/}
          {/*    justifyContent: 'center',*/}
          {/*    alignItems: 'center'*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Short Futures Returns*/}
          {/*</h5>*/}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row'
            }}
          >
            <Table className={classes.table} style={{ maxWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ color: '#FFF' }}>
                    Instrument
                  </TableCell>
                  <TableCell align="left" style={{ color: '#FFF' }}>
                    Last
                  </TableCell>
                  <TableCell align="left" style={{ color: '#FFF' }}>
                    APR %
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.instruments.map(item => (
                  <TableRow>
                    <TableCell align="left" style={{ color: '#dc6b02' }}>
                      {item.instrumentName}
                    </TableCell>
                    <TableCell align="left" style={{ color: '#dc6b02' }}>
                      {this.state[item.instrumentName]}
                    </TableCell>
                    <TableCell align="left" style={{ color: '#dc6b02' }}>
                      {this.state['RET-' + item.instrumentName]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/*<Button*/}
            {/*  className={classes.button}*/}
            {/*  onClick={()=>this.getWebsocketsData(instrument)}*/}
            {/*  variant="outlined"*/}
            {/*  // color="primary"*/}
            {/*>Compute</Button>*/}
          </div>

          <br />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            {/*<Paper className={classes.elementPadding}>*/}
            {/*Main graph*/}
            <XYPlot
              width={340}
              height={200}
              xType="time"
              margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
            >
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis tickLabelAngle={-45} />
              <YAxis />
              <MarkSeries data={this.state.chartBTC} color="#ba4fb9" />
              <LabelSeries
                animation
                allowOffsetToBeReversed
                data={this.state.chartBTC}
                color="#dc6b02"
              />
            </XYPlot>
            {/*</Paper>*/}
            {/*<Paper className={classes.elementPadding}>*/}
            {/*Main graph*/}
            <XYPlot
              width={340}
              height={200}
              xType="time"
              margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
            >
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis tickLabelAngle={-45} />
              <YAxis />
              <MarkSeries
                className="mark-series-example"
                strokeWidth={2}
                sizeRange={[5, 15]}
                data={this.state.chartETH}
                color="#ba4fb9"
              />
              <LabelSeries
                animation
                allowOffsetToBeReversed
                data={this.state.chartETH}
              />
            </XYPlot>
            {/*</Paper>*/}
            {/*<Button*/}
            {/*  className={classes.button}*/}
            {/*  onClick={()=>this.getBtcFuturesContango()}*/}
            {/*  variant="outlined"*/}
            {/*  // color="primary"*/}
            {/*>BTC</Button>*/}
            {/*<Button*/}
            {/*  className={classes.button}*/}
            {/*  onClick={()=>this.getEthFuturesContango()}*/}
            {/*  variant="outlined"*/}
            {/*  // color="primary"*/}
            {/*>ETH</Button>*/}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <div>
            <h5
              style={{
                color: '#dc6b02',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              BTC three months contango
            </h5>
            <Paper className={classes.elementPadding}>
              {/*Main graph*/}
              <XYPlot
                width={340}
                height={220}
                xType="time"
                margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis tickLabelAngle={-45} />
                <YAxis />
                <LineSeries
                  className="btc-contango"
                  strokeWidth={2}
                  sizeRange={[5, 15]}
                  data={this.state.btc_3_months_contango}
                />
                {/*<LabelSeries animation allowOffsetToBeReversed data={this.state.btc_contango}/>*/}
              </XYPlot>
            </Paper>
          </div>

          <div>
            <h5
              style={{
                color: '#dc6b02',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              BTC six months contango
            </h5>
            <Paper className={classes.elementPadding}>
              {/*Main graph*/}
              <XYPlot
                width={340}
                height={220}
                xType="time"
                margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis tickLabelAngle={-45} />
                <YAxis />
                <LineSeries
                  className="btc-contango"
                  strokeWidth={2}
                  sizeRange={[5, 15]}
                  data={this.state.btc_6_months_contango}
                />
                {/*<LabelSeries animation allowOffsetToBeReversed data={this.state.btc_contango}/>*/}
              </XYPlot>
            </Paper>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <div>
            <h5
              style={{
                color: '#dc6b02',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              ETH three months contango
            </h5>
            <Paper className={classes.elementPadding}>
              {/*Main graph*/}
              <XYPlot
                width={340}
                height={220}
                xType="time"
                margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis tickLabelAngle={-45} />
                <YAxis />
                <LineSeries
                  className="btc-contango"
                  strokeWidth={2}
                  sizeRange={[5, 15]}
                  data={this.state.eth_3_months_contango}
                />
                {/*<LabelSeries animation allowOffsetToBeReversed data={this.state.btc_contango}/>*/}
              </XYPlot>
            </Paper>
          </div>

          <div>
            <h5
              style={{
                color: '#dc6b02',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              ETH six months contango
            </h5>
            <Paper className={classes.elementPadding}>
              {/*Main graph*/}
              <XYPlot
                width={340}
                height={220}
                xType="time"
                margin={{ bottom: 50, left: 50, right: 10, top: 20 }}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis tickLabelAngle={-45} />
                <YAxis />
                <LineSeries
                  className="btc-contango"
                  strokeWidth={2}
                  sizeRange={[5, 15]}
                  data={this.state.eth_6_months_contango}
                />
                {/*<LabelSeries animation allowOffsetToBeReversed data={this.state.btc_contango}/>*/}
              </XYPlot>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

Stat.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Stat);
