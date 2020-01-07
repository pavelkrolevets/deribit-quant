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
import {BlackScholes} from './bsm'
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
  Crosshair
} from 'react-vis';
import { compute_bsm, get_api_keys, compute_pnl } from '../../../utils/http_functions';



const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  chart:{

  }
});

const deribit_http = "https://www.deribit.com";

class Simulate extends Component {
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
      indexBtc: 0,
      indexEth: 0,
      account: [],
      time: new Date().toLocaleTimeString(),
      range_min:'',
      range_max:'',
      step:'',
      risk_free:'',
      vola:'',
      zoom: 1.2,
      instrument: "",
      instrumentData:[],
      bids: [],
      asks: [],
      instrumentAskIv: "",
      instrumentBidIv: "",
      instrumentDelta: "",
      instrumentLastPrice: "",
      underlying_currency: "BTC",
      expiration_list: [
        { id: 100, strike: "31DEC19" },
        { id: 101, strike: "27MAR202" },
        { id: 102, strike: "31JAN202" }],
      underlying_srike: "",
      strike_list: [
        { id: 100, strike: "1000" },
        { id: 101, strike: "2000" },
        { id: 102, strike: "3000" }],
      underlying_expiration: ""
    };

  }


  async componentWillMount(){

    await get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({keys: result.data});
      });
    await this.getWebsocketsData();


    // this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
    // this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
    // this.web3.eth.getAccounts(function (error, res) {
    //   if (!error) {
    //     console.log(res);
    //   } else {
    //     console.log(error);
    //   }
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

  getStrike(instrument){
    let parsed_string = instrument.split('-');
    return parsed_string[2]
  }

  getType(instrument){
    let parsed_string = instrument.split('-');
    return parsed_string[3]
  }
  getExpiration(instrument){
    let parsed_string = instrument.split('-');
    return parsed_string[1]
  }

  handleChange = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
  };

  getWebsocketsData(){
    let that=this;
    return new Promise(function(resolve, reject) {
      let RestClient = require("deribit-api").RestClient;
      let restClient = new RestClient(that.state.keys.api_pubkey, that.state.keys.api_privkey, deribit_http);

      const WebSocket = require('ws');
      const ws = new WebSocket('wss://www.deribit.com/ws/api/v1/');

      ws.on('open', function open() {
        var args = {
          "instrument": ["index"],
          "event": ["announcement"],
          "currency": "all"
        };
        var obj = {
          "id": 5232,
          "action": "/api/v1/private/subscribe",
          "arguments": args,
          sig: restClient.generateSignature("/api/v1/private/subscribe", args)
        };
        console.log('Request object', obj);
        resolve(ws.send(JSON.stringify(obj)));
      });

      ws.on('message', function incoming(data) {
        console.log('on message');



        if(data.length > 0)
        {
          var obj = JSON.parse(data);
          console.log(obj.notifications);
          if (typeof obj.notifications !== 'undefined' && obj.notifications.length!==0){
            if (obj.notifications.result.btc !== 'undefined' ){
              that.setState({...that.state, indexBtc: obj.notifications.result.btc});
              console.log("Index BTC", that.state.indexBtc);
            } else {
              that.setState({...that.state, indexEth: obj.notifications.result.eth});
              console.log("Index ETH", that.state.indexEth);
            }

            // let value = BlackScholes("call", parseInt(obj.notifications[0].result.iPx), 8000, 0.1, 0.01, 0.6);
            // console.log("Value :", value);
          };


        }
      });
    })
  }

  unsubscribe(instrument){
    let RestClient = require("deribit-api").RestClient;
    let restClient = new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

    const WebSocket = require('ws');
    const ws = new WebSocket('wss://www.deribit.com/ws/api/v1/');

    ws.on('open', function open() {
      var args = {
        "instrument": ["index"],
        "event": ["announcement"],
      };
      var obj = {
        "id": 5232,
        "action": "/api/v1/private/unsubscribe",
        "arguments": args,
        sig: restClient.generateSignature("/api/v1/private/unsubscribe", args)
      };
      console.log('Request object', obj);
      ws.send(JSON.stringify(obj));
    });
  }

  async plot(){
    let pos = this.state.positions[0];

    await this.computeBSM(parseInt(pos.averageUsdPrice), 0.3, this.getStrike(pos.instrument), 0.7, 'call', 'sell')
      .then(result=>this.setState({chart_data_current: result}));
    await this.computeBSM(parseInt(pos.averageUsdPrice), 0.00001, this.getStrike(pos.instrument), 0.7, 'call', 'sell')
      .then(result=>this.setState({chart_data_at_zero: result}));
  }

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
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  async get_open_positions(){

    function calculate(item, index, arr) {
      console.log(item);
      console.log(index);
    }

    this.state.positions.forEach(calculate)

  }

  async computePnL(){
    let range_min = 10;
    let range_max = parseInt(this.state.index)+parseInt(this.state.index)*this.state.zoom;
    // if (parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom < 0){
    //   range_min = 0;
    // }
    // else {
    //   range_min = parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom;
    // }

    let step = 100;
    let risk_free = 0.03;
    let vola = 0.8;
    compute_pnl(this.props.user.token,this.props.email, range_min, range_max, step, risk_free, vola)
      .then(result => {console.log(result.data.pnl);
        this.setState({chart_data_current: result.data.pnl,
          chart_data_at_zero: result.data.pnl_at_exp})})
  }

  zoomIn(){
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.setState((prevState, props) => ({zoom: prevState.zoom+0.2})));
      return null
    });
    promise.then(()=>this.computePnL());
  }
  zoomOut(){
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.setState((prevState, props) => ({zoom: prevState.zoom-0.2})));
      return null
    });
    promise.then(()=>this.computePnL());
  }

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    let {instrument} = this.state;
    let {strike_list,expiration_list} = this.state;


    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Analyze single option</h4>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"row"}}>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Currency</InputLabel>
            <Select
              value={this.state.underlying_currency}
              onChange={
                this.handleChange("underlying_currency")
              }
              inputProps={{
                name: 'underlying_currency',
                id: 'underlying_currency-simple',
              }}
            >
              <MenuItem value={"BTC"}>BTC</MenuItem>
              <MenuItem value={"ETH"}>ETH</MenuItem>
            </Select>
          </FormControl>

          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Expiration</InputLabel>
            <Select
              value={this.state.underlying_expiration}
              onChange={
                this.handleChange("underlying_expiration")
              }
              inputProps={{
                name: 'underlying_expiration',
                id: 'underlying_expiration-simple',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                expiration_list.map(item => {
                  return <MenuItem value={item.id}>{item.strike}</MenuItem>
                })
              }
            </Select>
          </FormControl>


          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Strike</InputLabel>
            <Select
              value={this.state.underlying_srike}
              onChange={
                this.handleChange("underlying_srike")
              }
              inputProps={{
                name: 'underlying_srike',
                id: 'underlying_srike-simple',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                strike_list.map(item => {
                  return <MenuItem value={item.id}>{item.strike}</MenuItem>
                })
              }
            </Select>
          </FormControl>

          <TextField
            required
            id="instrument id"
            label="Instrument ID"
            defaultValue=""
            variant="filled"
            onChange={this.handleChange('instrument')}
          />



          <Button
            className={classes.button}
            onClick={()=>this.getWebsocketsData(instrument)}
            variant="outlined"
            // color="primary"
          >Compute</Button>
        </div>

        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          {/*Main graph*/}
          <XYPlot width={700} height={500} onMouseLeave={this._onMouseLeave} {...{yDomain}}>
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis on0={true}/>
            <YAxis on0={true}/>
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
      </div>
    );
  }
}


Simulate.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Simulate);
