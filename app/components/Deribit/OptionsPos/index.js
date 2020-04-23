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
      account: [],
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
      currency: 'BTC'
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
      this.updateData();
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

    var account = {
      jsonrpc: '2.0',
      id: 2515,
      method: 'private/get_account_summary',
      params: {
        currency: this.state.currency
        // "extended" : true
      }
    };

    ws.send(JSON.stringify(index));
    ws.send(JSON.stringify(fut_positions));
    ws.send(JSON.stringify(opt_positions));
    ws.send(JSON.stringify(account));

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
    if (msg.id === 2515) {
      this.setState({ account: [msg.result] });
      console.log('Account : ', msg.result);
    }
  }

  async updateData() {
    let RestClient = await require('deribit-api').RestClient;
    this.restClient = await new RestClient(
      this.state.keys.api_pubkey,
      this.state.keys.api_privkey,
      deribit_http
    );

    // ws.onopen = async function () {
    //   await ws.send(JSON.stringify(positionsEth));
    //
    // };

    await this.restClient.index(result => {
      this.restClient.positions(result => {
        console.log('Positions: ', result.result);
        this.setState({ positions: result.result });
        let strike = this.getStrike(this.state.positions[0].instrument);
        console.log(strike);
        this.computePnL();
      });
    });

    // await this.restClient.account((result) => {
    //   console.log("Account: ", result.result);
    //   this.setState({account: [result.result]});
    // });
  }

  async componentDidMount() {
    // this.interval()
    // setInterval(() => {
    //   this.plot();
    //   this.updateData();
    //   this.setState({time: new Date().toLocaleTimeString()})
    // }, 30000);
  }

  getStrike(instrument) {
    let parsed_string = instrument.split('-');
    return parsed_string[2];
  }

  getType(instrument) {
    let parsed_string = instrument.split('-');
    return parsed_string[3];
  }
  getExpiration(instrument) {
    let parsed_string = instrument.split('-');
    return parsed_string[1];
  }

  async plot() {
    let pos = this.state.positions[0];

    await this.computeBSM(
      parseInt(pos.averageUsdPrice),
      0.3,
      this.getStrike(pos.instrument),
      0.7,
      'call',
      'sell'
    ).then(result => this.setState({ chart_data_current: result }));
    await this.computeBSM(
      parseInt(pos.averageUsdPrice),
      0.00001,
      this.getStrike(pos.instrument),
      0.7,
      'call',
      'sell'
    ).then(result => this.setState({ chart_data_at_zero: result }));
  }

  async computeBSM(trade_price, T, strike, vola, option_type, direction) {
    let data = [];
    let S0 = [];
    let chart_data = [];

    for (
      let i = parseInt(strike) - 10000;
      i < parseInt(strike) + 10000;
      i += 1000
    ) {
      data.push(
        JSON.stringify({
          S0: i,
          K: parseInt(strike),
          T: T,
          r: 0.03,
          sigma: vola
        })
      );
      S0.push(i);
    }
    console.log(data);
    await compute_bsm(
      this.props.user.token,
      option_type,
      data,
      direction,
      trade_price
    ).then(response => {
      console.log(response);
      this.setState({ option_values: response.data.option_values });
    });

    let y_range = [];
    for (let i = 0; i < S0.length; i++) {
      chart_data.push({ x: S0[i], y: this.state.option_values[i] });
      y_range.push(this.state.option_values[i] - trade_price);
    }
    this.setState({
      yDomain: [Math.min(...y_range) - 1000, Math.max(...y_range) + 1000]
    });

    return chart_data;
  }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.state.chart_data_current[index]] });
  };

  computePnl() {
    let current_values = [];
    let values_at_zero = [];
    let date = new Date();
    let now = this.state.selectedDate;
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeToExp = diffDays / 365;

    if (this.state.underlying_currency === 'BTC') {
      for (let i = 1; i <= 20002; i += 100) {
        if (this.state.direction === 'Buy') {
          let current_value =
            (BlackScholes(
              this.state.option_type,
              i,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                this.state.index,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;
          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              this.state.option_type,
              i,
              this.state.underlying_strike,
              0.00001,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                this.state.index,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;
          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        } else if (this.state.direction === 'Sell') {
          let current_value =
            (BlackScholes(
              this.state.option_type,
              this.state.index,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                i,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;
          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              this.state.option_type,
              this.state.index,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                i,
                this.state.underlying_strike,
                0.00001,
                0.01,
                this.state.volatility
              )) *
            i;
          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        }
      }
      console.log('Value current:', current_values);
      console.log('Value at zero:', values_at_zero);
      this.setState({ ...this.state, chart_data_current: current_values });
      this.setState({ ...this.state, chart_data_at_zero: values_at_zero });
      this.setState({ yDomain: [-10000, 10000] });
      if (this.state.manual_index === false) {
        this.setState({ index: this.state.indexBtc });
      }

      this.setState({
        impl_option_value: BlackScholes(
          this.state.option_type,
          this.state.index,
          this.state.underlying_strike,
          timeToExp,
          0.01,
          this.state.volatility
        )
      });
    } else if (this.state.underlying_currency === 'ETH') {
      for (let i = 0.1; i <= 1000; i += 10) {
        if (this.state.direction === 'Buy') {
          let current_value =
            (BlackScholes(
              this.state.option_type,
              i,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                this.state.index,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;

          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              this.state.option_type,
              i,
              this.state.underlying_strike,
              0.00001,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                this.state.index,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;

          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        } else if (this.state.direction === 'Sell') {
          let current_value =
            (BlackScholes(
              this.state.option_type,
              this.state.index,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                i,
                this.state.underlying_strike,
                timeToExp,
                0.01,
                this.state.volatility
              )) *
            i;

          // let value_at_zero = BlackScholes("call", parseInt(that.state.indexBtc), 10000, 0.00001, 0.01, 0.6);
          let value_at_zero =
            (BlackScholes(
              this.state.option_type,
              this.state.index,
              this.state.underlying_strike,
              timeToExp,
              0.01,
              this.state.volatility
            ) -
              BlackScholes(
                this.state.option_type,
                i,
                this.state.underlying_strike,
                0.00001,
                0.01,
                this.state.volatility
              )) *
            i;

          values_at_zero.push({ x: i, y: value_at_zero });
          current_values.push({ x: i, y: current_value });
        }
      }
      console.log('Value current:', current_values);
      console.log('Value at zero:', values_at_zero);
      this.setState({ ...this.state, chart_data_current: current_values });
      this.setState({ ...this.state, chart_data_at_zero: values_at_zero });
      this.setState({ yDomain: [-1000, 1000] });
      if (this.state.manual_index === false) {
        this.setState({ index: this.state.indexEth });
      }
      this.setState({
        impl_option_value: BlackScholes(
          this.state.option_type,
          this.state.index,
          this.state.underlying_strike,
          timeToExp,
          0.01,
          this.state.volatility
        )
      });
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
                    <TableCell align="center" style={{ color: '#dc6b02' }}>
                      Equity
                    </TableCell>
                    <TableCell align="center" style={{ color: '#dc6b02' }}>
                      Global delta
                    </TableCell>
                    <TableCell align="center" style={{ color: '#dc6b02' }}>
                      Index
                    </TableCell>
                    <TableCell align="center" style={{ color: '#dc6b02' }}>
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
            <div>
              {/*Table with parameters*/}
              <Paper>
                <div>
                  <Table className={classes.table} size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Instrument</TableCell>
                        <TableCell align="center">Amount</TableCell>
                        <TableCell align="center">Direction</TableCell>
                        <TableCell align="center">Delta</TableCell>
                        <TableCell align="center">Average price</TableCell>
                        <TableCell align="center">Average price USD</TableCell>
                        <TableCell align="center">PnL</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.positions.map((row, i) => (
                        <TableRow
                          key={i}
                          // onClick={event => this.handleClick(event, row.pid)}
                          selected
                          hover
                        >
                          <TableCell align="center">{row.instrument}</TableCell>
                          <TableCell align="center">
                            {parseFloat(row.amount).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">{row.direction}</TableCell>
                          <TableCell align="center">
                            {parseFloat(row.delta).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            {parseFloat(row.averagePrice).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            {parseFloat(row.averageUsdPrice).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            {parseFloat(row.profitLoss).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Paper>
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
