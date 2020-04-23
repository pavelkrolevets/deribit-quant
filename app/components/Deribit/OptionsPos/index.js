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
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { BlackScholes } from '../Simulate/bsm';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Crosshair
} from 'react-vis';
import {
  compute_bsm,
  get_api_keys,
  compute_pnl
} from '../../../utils/http_functions';

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
  appBar: {
    background: '#920017',
    borderRadius: 3,
    border: 0,
    padding: '0 30px',
    height: '10%'
  }
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const WebSocket = require('ws');
var ws = new WebSocket('wss://www.deribit.com/ws/api/v2/');

const deribit_http = 'https://www.deribit.com';

class DeribitOptionPos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current: [],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      yDomain: [-7000, 7000],
      keys: {},
      positions: [],
      index: 0,
      account: [{account:0, delta_total:0}],
      time: new Date().toLocaleTimeString(),
      range_min: '',
      range_max: '',
      step: '',
      risk_free: '',
      vola: '',
      zoom: 1.2,
      TabValue: 0,
      width: 0,
      height: 0,
      currency: 'ETH',
      fut_positions: [],
      opt_positions: [],
      all_instruments: [],
      client_positions: [{
        instrument_name: '',
        expiration: 0,
        size: 0,
        average_price: 0,
        kind: '',
        direction: '',
        option_type: '',
        strike: 0,
        delta: 0,
        total_profit_loss: 0
      }],
      volatility_btc: 0.8,
      volatility_eth: 0.8
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.eventHandler = this.eventHandler.bind(this);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  async componentWillMount() {
    await get_api_keys(this.props.user.token, this.props.email).then(result => {
      console.log(result);
      this.setState({ keys: result.data });
    });

    var auth = {
      jsonrpc: '2.0',
      id: 9929,
      method: 'public/auth',
      params: {
        grant_type: 'client_credentials',
        client_id: this.state.keys.api_pubkey,
        client_secret: this.state.keys.api_privkey
      }
    };

    ws.onopen = function() {
      ws.send(JSON.stringify(auth));
    };

    ws.onmessage = e => {
      this.eventHandler(JSON.parse(e.data));
    };

    setInterval(() => {
      this.getData();
      // this.updateData();
    }, 5000);
  }

  getData() {
    var index = {
      jsonrpc: '2.0',
      method: 'public/get_index',
      id: 42,
      params: {
        currency: this.state.currency
      }
    };

    var fut_positions = {
      jsonrpc: '2.0',
      id: 2236,
      method: 'private/get_positions',
      params: {
        currency: this.state.currency,
        kind: 'future'
      }
    };

    var opt_positions = {
      jsonrpc: '2.0',
      id: 2237,
      method: 'private/get_positions',
      params: {
        currency: this.state.currency,
        kind: 'option'
      }
    };

    var positions = {
      jsonrpc: '2.0',
      id: 2238,
      method: 'private/get_positions',
      params: {
        currency: this.state.currency,
      }
    };

    var account = {
      jsonrpc: '2.0',
      id: 2515,
      method: 'private/get_account_summary',
      params: {
        currency: this.state.currency
        // "extended" : true
      }
    };

    var all_instruments =
      {
        "jsonrpc" : "2.0",
        "id" : 7617,
        "method" : "public/get_instruments",
        "params" : {
          "currency" : this.state.currency,
          "expired" : false
        }
      };

    ws.send(JSON.stringify(index));
    ws.send(JSON.stringify(fut_positions));
    ws.send(JSON.stringify(opt_positions));
    ws.send(JSON.stringify(account));
    ws.send(JSON.stringify(positions));
    ws.send(JSON.stringify(all_instruments));

    // Update time
    this.setState({ time: new Date().toLocaleTimeString() });
  }

  eventHandler(msg) {
    console.log('received from server : ', msg);
    if (msg.id === 42) {
      this.setState({ index: msg.result.edp });
      console.log('Index : ', msg.result.edp);
    }
    if (msg.id === 2236) {
      this.setState({ fut_positions: msg.result });
      console.log('Fut_pos : ', msg.result);
    }
    if (msg.id === 2237) {
      this.setState({ opt_positions: msg.result });
      console.log('Opt_pos : ', msg.result);
    }
    if (msg.id === 2238) {
      this.setState({ positions: msg.result });
      console.log('Positions : ', msg.result);
    }
    if (msg.id === 2515) {
      this.setState({ account: [msg.result] });
      console.log('Account : ', msg.result);
    }
    if (msg.id === 7617) {
      this.setState({ all_instruments: msg.result });
      console.log('Instruments : ', msg.result);
      this.prepareClientPositions();
      this.computeTotalPnl();
    }

  }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.state.chart_data_current[index]] });
  };

  prepareClientPositions(){

    let client_positions =[];
    for (let position of this.state.positions){
        for (let instruments of this.state.all_instruments){
          if (position.instrument_name === instruments.instrument_name && position.direction !=="zero"){
            let exp = new Date(parseInt(instruments.expiration_timestamp));
            client_positions.push(
              {
                instrument_name: position.instrument_name,
                expiration: exp,
                size: position.size,
                average_price: position.average_price,
                kind: position.kind,
                direction: position.direction,
                option_type: instruments.option_type,
                strike: instruments.strike,
                delta: position.delta,
                total_profit_loss: position.total_profit_loss
              })
          }
        }
      }
    console.log("Client positions: ", client_positions);
    this.setState({client_positions: client_positions})
  }

  computeTotalPnl(){
    let total_pnl_current = [];
    let total_pnl_at_zero = [];

    for (let instrument of this.state.client_positions){
      if (instrument.kind === 'option'){
        console.log("Calc pos: ", instrument);
        this.computeOptPnl(instrument)
          .then(result => {
            console.log('Value current:', result[0]);
            console.log('Value at zero:', result[1]);
            total_pnl_current.push(result[0]);
            total_pnl_at_zero.push(result[1])
          })
      }
    }
  }

  async computeOptPnl(instrument) {
    let current_values = [];
    let values_at_zero = [];
    let date = instrument.expiration;
    let now = Date.now();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeToExp = diffDays / 365;

    console.log("Time to exp", timeToExp);

    if (this.state.currency === 'BTC') {
      for (let i = 1; i <= 20002; i += 100) {
        if (instrument.direction === 'buy') {
          let current_value =
            (BlackScholes(
              instrument.option_type,
              i,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_btc
            ) -
              BlackScholes(
                instrument.option_type,
                this.state.index,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility_btc
              )) * i;
          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              instrument.option_type,
              i,
              instrument.strike,
              0.00001,
              0.01,
              this.state.volatility_btc
            ) -
              BlackScholes(
                instrument.option_type,
                this.state.index,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) * i;
          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        } else if (instrument.direction === 'Sell') {
          let current_value =
            (BlackScholes(
              instrument.option_type,
              this.state.index,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_btc
            ) -
              BlackScholes(
                instrument.option_type,
                i,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility_btc
              )) * i;
          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              instrument.option_type,
              this.state.index,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_btc
            ) -
              BlackScholes(
                instrument.option_type,
                i,
                instrument.strike,
                0.00001,
                0.01,
                this.state.volatility_btc
              )) * i;
          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        }
      }
      // console.log('Value current:', current_values);
      // console.log('Value at zero:', values_at_zero);
      // this.setState({ ...this.state, chart_data_current: current_values });
      // this.setState({ ...this.state, chart_data_at_zero: values_at_zero });
      // this.setState({ yDomain: [-10000, 10000] });

    } else if (this.state.currency === 'ETH') {
      for (let i = 0.1; i <= 1000; i += 10) {
        if (instrument.direction === 'buy') {
          let current_value =
            (BlackScholes(
              instrument.option_type,
              i,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_eth
            ) -
              BlackScholes(
                instrument.option_type,
                this.state.index,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility_eth
              )) * i;

          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              instrument.option_type,
              i,
              instrument.strike,
              0.00001,
              0.01,
              this.state.volatility_eth
            ) -
              BlackScholes(
                instrument.option_type,
                this.state.index,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility_eth
              )) * i;

          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        } else if (instrument.direction === 'sell') {
          let current_value =
            (BlackScholes(
              instrument.option_type,
              this.state.index,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_eth
            ) -
              BlackScholes(
                instrument.option_type,
                i,
                instrument.strike,
                timeToExp,
                0.01,
                this.state.volatility_eth
              )) * i;

          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              instrument.option_type,
              this.state.index,
              instrument.strike,
              timeToExp,
              0.01,
              this.state.volatility_eth
            ) -
              BlackScholes(
                instrument.option_type,
                i,
                instrument.strike,
                0.00001,
                0.01,
                this.state.volatility_eth
              )) *
            i;

          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        }
      }
      // console.log('Value current:', current_values);
      // console.log('Value at zero:', values_at_zero);
      // this.setState({ ...this.state, chart_data_current: current_values });
      // this.setState({ ...this.state, chart_data_at_zero: values_at_zero });
      // this.setState({ yDomain: [-1000, 1000] });

      return [current_values, values_at_zero]
    }
  }

  // async computePnL(){
  //   let range_min = 10;
  //   let range_max = parseInt(this.state.index)+parseInt(this.state.index)*this.state.zoom;
  //   // if (parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom < 0){
  //   //   range_min = 0;
  //   // }
  //   // else {
  //   //   range_min = parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom;
  //   // }
  //
  //   let step = 100;
  //   let risk_free = 0.03;
  //   let vola = 0.8;
  //   compute_pnl(this.props.user.token,this.props.email, range_min, range_max, step, risk_free, vola)
  //     .then(result => {console.log(result.data.pnl);
  //       this.setState({chart_data_current: result.data.pnl,
  //         chart_data_at_zero: result.data.pnl_at_exp})})
  // }

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

  handleTabChange = (event, TabValue) => {
    this.setState({ TabValue });
  };

  render() {
    const { classes } = this.props;
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let { yDomain } = this.state;
    const { TabValue } = this.state;

    return (
      <div
        data-tid="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'black',
          height: '100%'
        }}
      >
        <AppBar position="static" className={classes.appBar}>
          <Tabs value={TabValue} onChange={this.handleTabChange} centered>
            <Tab label="BTC positions" />
            <Tab label="ETH positions" />
          </Tabs>
        </AppBar>

        {/*//BTC positions*/}
        {TabValue === 0 && (
          <TabContainer>
            {/*<h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions </h4>*/}
            <div>
              <Table className={classes.table} size="small">
                <TableHead>
                  {/*<TableRow style={{backgroundColor:'red', color: 'white'}}>*/}
                  <TableRow>
                    <TableCell align="center" style={{ color: '#FFF' }}>
                      Equity
                    </TableCell>
                    <TableCell align="center" style={{ color: '#FFF' }}>
                      Global delta
                    </TableCell>
                    <TableCell align="center" style={{ color: '#FFF' }}>
                      Index
                    </TableCell>
                    <TableCell align="center" style={{ color: '#FFF' }}>
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.account.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell align="center" style={{ color: '#dc6b02' }}>
                        {parseFloat(row.equity).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" style={{ color: '#dc6b02' }}>
                        {parseFloat(row.delta_total).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" style={{ color: '#dc6b02' }}>
                        {this.state.index}
                      </TableCell>
                      <TableCell align="center" style={{ color: '#dc6b02' }}>
                        {this.state.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <h6 style={{ color: '#FFF' }}>Range</h6>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  alignItems: 'left'
                }}
              >
                <IconButton onClick={() => this.zoomIn()}>
                  <ZoomIn color="secondary" />
                </IconButton>
                <IconButton onClick={() => this.zoomOut()}>
                  <ZoomOut color="secondary" />
                </IconButton>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/*Main graph*/}
              <XYPlot
                width={700}
                height={500}
                onMouseLeave={this._onMouseLeave}
                {...{ yDomain }}
              >
                <HorizontalGridLines />
                <VerticalGridLines />
                <XAxis on0={true} />
                <YAxis on0={true} />
                <ChartLabel
                  text="Price"
                  className="alt-x-label"
                  includeMargin={false}
                  xPercent={0.025}
                  yPercent={1.01}
                />

                <ChartLabel
                  text="Profit"
                  className="alt-y-label"
                  includeMargin={false}
                  xPercent={0.06}
                  yPercent={0.06}
                  style={{
                    transform: 'rotate(-90)',
                    textAnchor: 'end'
                  }}
                />
                <LineSeries
                  className="first-series"
                  onNearestX={this._onNearestX}
                  data={this.state.chart_data_current}
                />
                <LineSeries data={this.state.chart_data_at_zero} />
                <Crosshair
                  values={this.state.crosshairValues}
                  className={'test-class-name'}
                />
                {/*<Crosshair*/}
                {/*values={[{x: parseInt(this.state.index), y:0}]}*/}
                {/*className={'market-class-name'}*/}
                {/*/>*/}
              </XYPlot>
            </div>
            <br/>
              {/* Positions*/}
                <div>
                  <Table className={classes.table} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" style={{ color: '#FFF' }}>Instrument</TableCell>
                        <TableCell align="center" style={{ color: '#FFF' }}>Amount</TableCell>
                        <TableCell align="center" style={{ color: '#FFF' }}>Direction</TableCell>
                        <TableCell align="center" style={{ color: '#FFF' }}>Delta</TableCell>
                        <TableCell align="center" style={{ color: '#FFF' }}>Average price</TableCell>
                        {/*<TableCell align="center">Average price USD</TableCell>*/}
                        <TableCell align="center" style={{ color: '#FFF' }}>PnL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.client_positions.map((row, i) => (
                        <TableRow
                          key={i}
                          // onClick={event => this.handleClick(event, row.pid)}
                          selected
                          hover
                        >
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {row.instrument_name}
                          </TableCell>
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {parseFloat(row.size).toFixed(2)}
                          </TableCell>
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {row.direction}
                          </TableCell>
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {parseFloat(row.delta).toFixed(2)}
                          </TableCell>
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {parseFloat(row.average_price).toFixed(2)}
                          </TableCell>
                          {/*<TableCell align="center">*/}
                          {/*  {parseFloat(row.averageUsdPrice).toFixed(2)}*/}
                          {/*</TableCell>*/}
                          <TableCell align="center" style={{ color: '#dc6b02' }}>
                            {parseFloat(row.total_profit_loss).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>




          </TabContainer>
        )}

        {/*//ETH positions*/}
        {TabValue === 1 && (
          <TabContainer>
            <h1 style={{ color: '#152880' }}>ETH pos</h1>
          </TabContainer>
        )}
      </div>
    );
  }
}

DeribitOptionPos.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DeribitOptionPos);
