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
import Chart_eth from './ChartContainer/chart_eth';
import Chart_btc from './ChartContainer/chart_btc';

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
  compute_pnl,
  verify_api_keys
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

const Store = require('electron-store');
const schema = {
  token: {
    type: 'string'
  },
  email: {
    type: 'string'
  },
  api_pubkey: {
    type: 'string'
  },
  api_privkey: {
    type: 'string'
  }
};
const store = new Store({ schema });

class DeribitOptionPos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart_data_current_btc: [],
      chart_data_at_zero_btc: [],
      chart_data_current_eth: [],
      chart_data_at_zero_eth: [],

      crosshairValues: [],

      yDomain_btc: [-10000, 10000],
      yDomain_eth: [-10000, 10000],

      xDomain_btc_start: 1000,
      xDomain_btc_stop: 50000,
      xDomain_eth_start: 20,
      xDomain_eth_stop: 2500,

      keys: {},
      positions: [],
      index: 0,
      account: [{ equity: 0, delta_total: 0 }],
      time: new Date().toLocaleTimeString(),
      range_min: '',
      range_max: '',
      step: '',
      risk_free: '',
      vola: '',
      zoom: 1.2,
      TabValue: 'BTC',
      width: 0,
      height: 0,
      currency: 'BTC',
      fut_positions: [],
      opt_positions: [],
      all_instruments: [],
      client_positions_btc: [
        {
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
        }
      ],
      client_positions_eth: [
        {
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
        }
      ],
      volatility_btc: 0.8,
      volatility_eth: 0.8
    };
    this.update_interval = null;
  }


  componentWillUnmount() {
    // console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
    // this.props.stop_saga_ws();
  }

  componentDidMount() {
    // console.log("api_pubkey, api_privkey", this.props.api_pubkey, this.props.api_privkey)
  }

  // componentWillReceiveProps() {
  //   console.log("Get props update");
  // }

  async componentWillMount() {
    try {
      let keys = {};
      keys.api_pubkey = await this.getFromStore('api_pubkey');
      keys.api_privkey = await this.getFromStore('api_privkey');
      await verify_api_keys(this.props.user.token, keys.api_pubkey, keys.api_privkey);
    } catch (e) {
      console.log("Error", e)
      this.setState({message: e});
          return (setTimeout(()=>{
            this.setState({showKeysErrModal: false});
            this.props.stop_saga_ws();
            this.setState({message: null});
            this.props.history.push('/profile');
          }, 2000));
    }
    // this.props.start_saga_ws();
    this.update_interval = setInterval(() => {
      this.prepareClientPositions_btc();
      this.prepareClientPositions_eth();
      this.computeTotalPnl();
      this.setState({ time: new Date().toLocaleTimeString() });
    }, 2000);

  }

  getFromStore(value) {
    if (store.get(value)) {
      let item = store.get(value);
      return Promise.resolve(item);
    } else {
      return Promise.reject(new Error('No value found'));
    }
  }
  computeyDomain(array){
    let yDomain =[];
    let ySeries = [];
    for (let i of array) {
      // console.log("Y", i.y);
      if (typeof i.y === 'number'){
        ySeries.push(i.y)
      }
    }
    let min_value = Math.min(...ySeries);
    let max_value = Math.max(...ySeries);
    let min = ()=> {if (Number.isFinite(min_value)&&min_value <= -500) {return Math.min(...ySeries)}else{return -500}};
    let max = ()=> {if (Number.isFinite(max_value)&&max_value >=  500) {return Math.max(...ySeries)}else{return  500}};
    yDomain = [min(), max()];
    let result = new Promise(function(resolve, reject) {resolve(yDomain)});
    return result
  }


  prepareClientPositions_btc() {
    let client_positions = [];
    for (let position of this.props.deribit_BTC_open_pos) {
      for (let instruments of this.props.deribit_BTC_all_instruments) {
        if (
          position.instrument_name === instruments.instrument_name &&
          position.direction !== 'zero'
        ) {
          let exp = new Date(parseInt(instruments.expiration_timestamp));
          client_positions.push({
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
          });
        }
      }
    }
    // console.log("Client positions btc: ", client_positions);
    this.setState({ client_positions_btc: client_positions});
  }

  prepareClientPositions_eth() {
    let client_positions = [];
    for (let position of this.props.deribit_ETH_open_pos) {
      for (let instruments of this.props.deribit_ETH_all_instruments) {
        if (
          position.instrument_name === instruments.instrument_name &&
          position.direction !== 'zero'
        ) {
          let exp = new Date(parseInt(instruments.expiration_timestamp));
          client_positions.push({
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
          });
        }
      }
    }
    // console.log("Client positions eth: ", client_positions);
    this.setState({ client_positions_eth: client_positions});
  }

  async computeTotalPnl() {
    let current_value_chart = [];
    let value_at_zero_chart = [];

    if (this.state.currency === 'BTC') {
      for (let i = this.state.xDomain_btc_start; i <= this.state.xDomain_btc_stop; i += 100) {
        let current_value = 0;
        let value_at_zero = 0;
        // console.log("Client positions: ", this.state.client_positions);
        for (let instrument of this.state.client_positions_btc) {
          if (instrument.kind === 'option') {
            // console.log("Calcul instrument: ", instrument);
            let opt_val = await this.computeBtcOptPnl(instrument, i);
            current_value += opt_val[0] * instrument.size;
            value_at_zero += opt_val[1] * instrument.size;
          }
          if (instrument.kind === 'future') {
            // console.log("Calcul instrument: ", instrument);
            let fut_val = this.computeFuturesPnl(instrument, i);
            current_value += fut_val;
            value_at_zero += fut_val;
          }
        }

        current_value_chart.push({ x: i, y: current_value });
        value_at_zero_chart.push({ x: i, y: value_at_zero });
      }

      let yDomain = await this.computeyDomain(value_at_zero_chart);
      this.setState({ ...this.state, chart_data_current_btc: current_value_chart });
      this.setState({ ...this.state, chart_data_at_zero_btc: value_at_zero_chart });
      // this.setState({ yDomain_btc: [-10000, 10000] });
      this.setState({ yDomain_btc: yDomain});
    }

    if (this.state.currency === 'ETH') {
      for (let i = this.state.xDomain_eth_start; i <= this.state.xDomain_eth_stop; i += 10) {
        let current_value = 0;
        let value_at_zero = 0;

        for (let instrument of this.state.client_positions_eth) {
          if (instrument.kind === 'option') {
            // console.log("Computing instr", instrument.instrument_name);
            let opt_val = await this.computeEthOptPnl(instrument, i);
            current_value += opt_val[0];
            value_at_zero += opt_val[1];
          }
          if (instrument.kind === 'future') {
            // console.log("Calcul instrument: ", instrument);
            let fut_val = this.computeFuturesPnl(instrument, i);
            current_value += fut_val;
            value_at_zero += fut_val;
          }
        }

        current_value_chart.push({ x: i, y: current_value });
        value_at_zero_chart.push({ x: i, y: value_at_zero });
      }
      let yDomain = await this.computeyDomain(value_at_zero_chart);
      this.setState({ ...this.state, chart_data_current_eth: current_value_chart });
      this.setState({ ...this.state, chart_data_at_zero_eth: value_at_zero_chart });
      this.setState({ yDomain_eth: yDomain});
    }

    // console.log("Current value chart", current_value_chart);
    // console.log("Value at zero chart", value_at_zero_chart);
  }

  computeFuturesPnl(instrument, S_price){
    let futures_value = 0;
    if (instrument.direction === 'buy') {
      futures_value = (instrument.size / instrument.average_price) * S_price - instrument.size;
    }
    if (instrument.direction === 'sell') {
      futures_value = -instrument.size - ((-instrument.size)/ instrument.average_price) * S_price;
    }
    return futures_value
  }

  async computeBtcOptPnl(instrument, S_price) {
    let current_value = 0;
    let value_at_zero = 0;

    let date = instrument.expiration;
    let now = Date.now();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeToExp = diffDays / 365;

    // console.log("Time to exp", timeToExp);
    // console.log("Index BTC", this.props.deribit_BTC_index);

    if (instrument.direction === 'buy') {
      current_value =
        (BlackScholes(
          instrument.option_type,
          S_price,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_btc
          ) -
          BlackScholes(
            instrument.option_type,
            this.props.deribit_BTC_index,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_btc
          )) * S_price - instrument.average_price * S_price;

      value_at_zero =
        (BlackScholes(
          instrument.option_type,
          S_price,
          instrument.strike,
          0.00001,
          0.01,
          this.state.volatility_eth
          ) -
          BlackScholes(
            instrument.option_type,
            this.props.deribit_BTC_index,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_eth
          )) * S_price - instrument.average_price * S_price;
    } else if (instrument.direction === 'sell') {
      current_value =
        (BlackScholes(
          instrument.option_type,
          this.props.deribit_BTC_index,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_eth
          ) -
          BlackScholes(
            instrument.option_type,
            S_price,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_eth
          )) * S_price + instrument.average_price * S_price;

      value_at_zero =
        (BlackScholes(
          instrument.option_type,
          this.props.deribit_BTC_index,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_eth
          ) -
          BlackScholes(
            instrument.option_type,
            S_price,
            instrument.strike,
            0.00001,
            0.01,
            this.state.volatility_eth
          )) * S_price + instrument.average_price * S_price;
    }
    return [current_value, value_at_zero];

    // console.log('Value current:', current_values);
    // console.log('Value at zero:', values_at_zero);
    // this.setState({ ...this.state, chart_data_current: current_values });
    // this.setState({ ...this.state, chart_data_at_zero: values_at_zero });
    // this.setState({ yDomain: [-10000, 10000] });
  }

  async computeEthOptPnl(instrument, S_price) {
    let current_value = 0;
    let value_at_zero = 0;

    let date = instrument.expiration;
    let now = Date.now();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeToExp = diffDays / 365;

    if (instrument.direction === 'buy') {
      current_value =
        (BlackScholes(
          instrument.option_type,
          S_price,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_eth
        ) -
          BlackScholes(
            instrument.option_type,
            this.props.deribit_ETH_index,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_eth
          )) * S_price - instrument.average_price * S_price;

      value_at_zero =
        (BlackScholes(
          instrument.option_type,
          S_price,
          instrument.strike,
          0.00001,
          0.01,
          this.state.volatility_eth
        ) -
          BlackScholes(
            instrument.option_type,
            this.props.deribit_ETH_index,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_eth
          )) * S_price - instrument.average_price * S_price;
    } else if (instrument.direction === 'sell') {
      current_value =
        (BlackScholes(
          instrument.option_type,
          this.props.deribit_ETH_index,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_eth
        ) -
          BlackScholes(
            instrument.option_type,
            S_price,
            instrument.strike,
            timeToExp,
            0.01,
            this.state.volatility_eth
          )) * S_price + instrument.average_price * S_price;

      value_at_zero =
        (BlackScholes(
          instrument.option_type,
          this.props.deribit_ETH_index,
          instrument.strike,
          timeToExp,
          0.01,
          this.state.volatility_eth
        ) -
          BlackScholes(
            instrument.option_type,
            S_price,
            instrument.strike,
            0.00001,
            0.01,
            this.state.volatility_eth
          )) * S_price + instrument.average_price * S_price;
    }
    return [current_value, value_at_zero];
  }

  zoomInBTC = () => {
    let start = this.state.xDomain_btc_start;
    let stop = this.state.xDomain_btc_stop;
    if (start < stop) {
      start += 1000;
      this.setState({xDomain_btc_start: start});
      // console.log("xDomain_btc_start", this.state.xDomain_btc_start)
    }
    if (stop > start){
      stop -= 1000;
      this.setState({xDomain_btc_stop: stop});
      // console.log("xDomain_btc_stop", this.state.xDomain_btc_stop)
    }
  };

  zoomOutBTC = () => {
    let start = this.state.xDomain_btc_start;
    let stop = this.state.xDomain_btc_stop;
    if (start - 1000 >= 1000){
      start -= 1000;
      this.setState({xDomain_btc_start: start});
      // console.log("xDomain_btc_start", this.state.xDomain_btc_start)
    }
    if (stop + 1000<=20000){
      stop +=1000;
      this.setState({xDomain_btc_stop: stop});
      // console.log("xDomain_btc_stop", this.state.xDomain_btc_stop)
    }
  };
  zoomInETH = () => {
    let start = this.state.xDomain_eth_start;
    let stop = this.state.xDomain_eth_stop;
    if (start < stop) {
      start += 100;
      this.setState({xDomain_eth_start: start});
      // console.log("xDomain_eth_start", this.state.xDomain_eth_start)
    }
    if (stop > start){
      stop -= 100;
      this.setState({xDomain_eth_stop: stop});
      // console.log("xDomain_eth_stop", this.state.xDomain_eth_stop)
    }
  };

  zoomOutETH = () => {
    let start = this.state.xDomain_eth_start;
    let stop = this.state.xDomain_eth_stop;
    if (start - 100 >= 20){
      start -= 100;
      this.setState({xDomain_eth_start: start});
      // console.log("xDomain_eth_start", this.state.xDomain_eth_start)
    }
    if (stop + 100<=1000){
      stop +=100;
      this.setState({xDomain_eth_stop: stop});
      // console.log("xDomain_eth_stop", this.state.xDomain_eth_stop)
    }
  };
  handleTabChange = (event, TabValue) => {
    // console.log("TabValue ",TabValue);
    this.setState({ TabValue });
    this.setState({ currency: TabValue });
  };

  render() {
    const { classes } = this.props;
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let { yDomain } = this.state;
    const { TabValue, currency } = this.state;

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
            <Tab label="BTC positions" value={'BTC'} />
            <Tab label="ETH positions" value={'ETH'} />
          </Tabs>
        </AppBar>

        {/*//BTC positions*/}
        {TabValue === 'BTC' && (
          <Chart_btc
            chart={{
              account: this.props.deribit_BTC_account_state,
              index: this.props.deribit_BTC_index,
              time: this.state.time,
              yDomain: this.state.yDomain_btc,
              chart_data_current: this.state.chart_data_current_btc,
              chart_data_at_zero: this.state.chart_data_at_zero_btc,
              // crosshairValues: this.state.crosshairValues_btc,
              client_positions: this.state.client_positions_btc,
            }}
            zoomIn={this.zoomInBTC}
            zoomOut={this.zoomOutBTC}
          />
        )}

        {/*//ETH positions*/}
        {TabValue === 'ETH' && (
          <Chart_eth
            chart={{
              account: this.props.deribit_ETH_account_state,
              index: this.props.deribit_ETH_index,
              time: this.state.time,
              yDomain: this.state.yDomain_eth,
              chart_data_current: this.state.chart_data_current_eth,
              chart_data_at_zero: this.state.chart_data_at_zero_eth,
              // crosshairValues: this.state.crosshairValues_eth,
              client_positions: this.state.client_positions_eth,
            }}
            zoomIn={this.zoomInETH}
            zoomOut={this.zoomOutETH}
          />
          // <TabContainer>
          //   <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions </h4>
          // </TabContainer>
        )}
      </div>
    );
  }
}

DeribitOptionPos.propTypes = {
  classes: PropTypes.object.isRequired,
  getTime: PropTypes.func,
  time: PropTypes.object,
  api_pubkey: PropTypes.string,
  api_privkey: PropTypes.string,
  start_saga_ws: PropTypes.func,
  stop_saga_ws: PropTypes.func,

  deribit_BTC_index: PropTypes.number,
  deribit_BTC_futures_pos: PropTypes.array,
  deribit_BTC_options_pos: PropTypes.array,
  deribit_BTC_account_state: PropTypes.array,
  deribit_BTC_open_pos: PropTypes.array,
  deribit_BTC_all_instruments: PropTypes.array,

  deribit_ETH_index: PropTypes.number,
  deribit_ETH_account_state: PropTypes.array,
  deribit_ETH_open_pos: PropTypes.array,
  deribit_ETH_all_instruments: PropTypes.array,
};

export default withStyles(styles)(DeribitOptionPos);
