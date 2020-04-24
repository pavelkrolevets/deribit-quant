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
import { BlackScholes } from './bsm';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from '@material-ui/pickers';
import 'date-fns';

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
  textField: {
    width: '100px'
  },
  formControlLabel: {
    color: 'primary'
  }
});

const deribit_http = 'https://www.deribit.com';

class Simulate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current: [],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      yDomain: [-10000, 10000],
      keys: {},
      positions: [],
      indexBtc: 0,
      indexEth: 0,
      index: 10000,
      volatility: 0.6,
      account: [],
      time: new Date().toLocaleTimeString(),
      range_min: '',
      range_max: '',
      step: '',
      risk_free: '',
      vola: '',
      zoom: 1.2,
      instrument: '',
      instrumentData: [],
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
      underlying_strike: 'None',
      strike_list: [],
      underlying_expiration: 'None',
      direction: 'Buy',
      direction_list: [
        { id: 1, direction: 'Buy' },
        { id: 2, direction: 'Sell' }
      ],
      ws_close: false,
      option_type: 'call',
      impl_option_value: 0,
      selectedDate: Date.now(),
      manual_index: false
    };
  }

  async componentWillMount() {
    let token = this.props.user.token;
    let email = this.props.email;
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(
        get_api_keys(token, email).then(result => {
          console.log(result);
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
    // this.setState({...this.state, ws_close: true});
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
        console.log('Index: ', result);
        that.setState({ index: result.result.btc });
        return result;
      })
      .then(() => {
        return new Promise(function(resolve, reject) {
          restClient.getinstruments(result => {
            let instruments = result.result.sort((a, b) =>
              a['strike'] > b['strike'] ? 1 : -1
            );
            console.log('Instruments: ', instruments);
            that.setState({ instruments: instruments });
            resolve(result);
          });
        });
      })
      .then(result => {
        that.getExpirations(result.result);
        let strikes = [];
        for (let i = 4000; i <= 36000; i += 1000) {
          strikes.push({ id: i, strike: i });
        }
        that.setState({ strike_list: strikes });
        that.getWebsocketsData();
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
      if (item !== '3000-01-01 08:00:00 GMT') {
        // let formatted_date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        var date = new Date(item);
        let exp =
          date.getDate().toString() +
          monthNames[date.getMonth()] +
          date
            .getFullYear()
            .toString()
            .substring(2, 4);
        result.push({ exp_short: exp, exp_datetime: date });
      }
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

  handleChangeCheckbox = event => {
    console.log(event.target.checked);
    this.setState({ manual_index: event.target.checked });
  };
  handleDateChange = name => event => {
    console.log(name, event);
    this.setState({ [name]: event });
  };
  handleChangeCurrency = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
    if (event.target.value === 'BTC') {
      let strikes = [];
      for (let i = 4000; i <= 36000; i += 1000) {
        strikes.push({ id: i, strike: i });
      }
      this.setState({ strike_list: strikes });
    }
    if (event.target.value === 'ETH') {
      let strikes = [];
      for (let i = 40; i <= 800; i += 20) {
        strikes.push({ id: i, strike: i });
      }
      this.setState({ strike_list: strikes });
    }
  };

  getWebsocketsData() {
    let that = this;
    this.setState({ ...this.state, ws_close: false });

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
          instrument: ['index'],
          event: ['announcement'],
          currency: 'all'
        };
        var obj = {
          id: 5232,
          action: '/api/v1/private/subscribe',
          arguments: args,
          sig: restClient.generateSignature('/api/v1/private/subscribe', args)
        };
        console.log('Request object', obj);
        resolve(ws.send(JSON.stringify(obj)));
      });

      ws.on('message', function incoming(data) {
        console.log('on message');

        if (data.length > 0) {
          var obj = JSON.parse(data);
          console.log(obj.notifications);
          if (
            typeof obj.notifications !== 'undefined' &&
            obj.notifications.length !== 0
          ) {
            if (typeof obj.notifications.result.btc !== 'undefined') {
              that.setState({
                ...that.state,
                indexBtc: obj.notifications.result.btc
              });
            } else if (typeof obj.notifications.result.eth !== 'undefined') {
              that.setState({
                ...that.state,
                indexEth: obj.notifications.result.eth
              });
            }
            console.log(
              'Index BTC',
              that.state.indexBtc,
              'Index ETH',
              that.state.indexEth
            );

            that.computePnl();

            if (that.state.ws_close === true) {
              console.log('Closing ws...');
              ws.close();
            }
          }
        }
      });
    });
  }

  unsubscribe() {
    this.setState({ ...this.state, ws_close: true });
  }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.state.chart_data_current[index]] });
  };

  async get_open_positions() {
    function calculate(item, index, arr) {
      console.log(item);
      console.log(index);
    }

    this.state.positions.forEach(calculate);
  }

  computePnl() {
    let current_values = [];
    let values_at_zero = [];
    let date = new Date(this.state.underlying_expiration);
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

  render() {
    const { classes } = this.props;
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let { yDomain } = this.state;
    let { instrument } = this.state;
    let { strike_list, expiration_list, direction_list } = this.state;

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
        <h4
          style={{
            color: '#152880',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          Analyze single option
        </h4>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.manual_index}
                  onChange={this.handleChangeCheckbox}
                  color="primary"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label={
                <Typography style={styles.formControlLabel} color="primary">
                  Manual index
                </Typography>
              }
            />
          </FormGroup>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Currency</InputLabel>
            <Select
              value={this.state.underlying_currency}
              onChange={this.handleChangeCurrency('underlying_currency')}
              inputProps={{
                name: 'underlying_currency',
                id: 'underlying_currency-simple'
              }}
            >
              <MenuItem value={'BTC'}>BTC</MenuItem>
              <MenuItem value={'ETH'}>ETH</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Type</InputLabel>
            <Select
              value={this.state.option_type}
              onChange={this.handleChange('option_type')}
              inputProps={{
                name: 'option_type',
                id: 'option_type-simple'
              }}
            >
              <MenuItem value={'call'}>Call</MenuItem>
              <MenuItem value={'put'}>Put</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Expiration</InputLabel>
            <Select
              value={this.state.underlying_expiration}
              onChange={this.handleChange('underlying_expiration')}
              inputProps={{
                name: 'underlying_expiration',
                id: 'underlying_expiration-simple'
              }}
            >
              <MenuItem value="None">
                <em>None</em>
              </MenuItem>
              {expiration_list.map(item => {
                return (
                  <MenuItem value={item.exp_datetime}>
                    {item.exp_short}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Strike</InputLabel>
            <Select
              value={this.state.underlying_strike}
              onChange={this.handleChange('underlying_strike')}
              inputProps={{
                name: 'underlying_strike',
                id: 'underlying_strike-simple'
              }}
            >
              <MenuItem value="None">
                <em>None</em>
              </MenuItem>
              {strike_list.map(item => {
                return <MenuItem value={item.strike}>{item.strike}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Direction</InputLabel>
            <Select
              value={this.state.direction}
              onChange={this.handleChange('direction')}
              inputProps={{
                name: 'direction',
                id: 'direction-simple'
              }}
            >
              <MenuItem value="None">
                <em>None</em>
              </MenuItem>
              {direction_list.map(item => {
                return (
                  <MenuItem value={item.direction}>{item.direction}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            value={this.state.index}
            id="outlined-name"
            label="Index"
            className={classes.textField}
            onChange={this.handleChange('index')}
            margin="normal"
            variant="outlined"
          />
          <TextField
            value={this.state.volatility}
            id="outlined-name"
            label="Vola"
            className={classes.textField}
            onChange={this.handleChange('volatility')}
            margin="normal"
            variant="outlined"
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Date"
              value={this.state.selectedDate}
              onChange={this.handleDateChange('selectedDate')}
              KeyboardButtonProps={{
                'aria-label': 'change date'
              }}
            />
          </MuiPickersUtilsProvider>
          );
          {/*<Button*/}
          {/*  className={classes.button}*/}
          {/*  onClick={()=>this.getWebsocketsData()}*/}
          {/*  variant="outlined"*/}
          {/*  // color="primary"*/}
          {/*>Compute</Button>*/}
          {/*<Button*/}
          {/*  className={classes.button}*/}
          {/*  onClick={()=>this.unsubscribe()}*/}
          {/*  variant="outlined"*/}
          {/*  // color="primary"*/}
          {/*>Stop</Button>*/}
        </div>
        <h5
          style={{
            color: 'gray',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          Implied option value {this.state.impl_option_value.toFixed(4)}
        </h5>
        <h6
          style={{
            color: 'gray',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          BTC: {this.state.indexBtc}, ETH: {this.state.indexEth}
        </h6>

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
            <Crosshair
              values={[{ x: parseInt(this.state.index), y: 0 }]}
              className={'market-class-name'}
            />
          </XYPlot>
        </div>
        <br />
      </div>
    );
  }
}

Simulate.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Simulate);
