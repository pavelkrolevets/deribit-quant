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
import {black_scholes} from './bsm'

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
      indexEth:0,
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
      instrumentLastPrice: ""
    };

  }


  async componentWillMount(){

    await get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({keys: result.data});
      });

    await this.updateData();

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


  async updateData(){

    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

    await this.restClient.index((result) => {
      console.log("Index: ", result);
      this.setState({indexBtc: result.result.btc});
    });

    await this.restClient.account((result) => {
      console.log("Account: ", result.result);
      this.setState({account: [result.result]});
    });
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
    // console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
  };

  getWebsocketsData(instrument){
    console.log("Instrument", instrument);
    let that=this;
    return new Promise(function(resolve, reject) {
      let RestClient = require("deribit-api").RestClient;
      let restClient = new RestClient(that.state.keys.api_pubkey, that.state.keys.api_privkey, deribit_http);

      const WebSocket = require('ws');
      const ws = new WebSocket('wss://www.deribit.com/ws/api/v1/');

      ws.on('open', function open() {
        var args = {
          "instrument": [instrument],
          "event": ["order_book"]
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

        let value = black_scholes(true, parseInt(this.state.indexBtc), 8000, 0.01, 0.8, 0.3);
        console.log("Value :", value);

        if(data.length > 0)
        {
          var obj = JSON.parse(data);
          console.log(obj.notifications);
          // let notifications = obj.notifications;
          console.log(obj.notifications);
          if (typeof obj.notifications !== 'undefined' && obj.notifications.length!==0){
            that.setState({...that.state, instrumentData: obj.notifications});
            that.setState({...that.state, bids: obj.notifications[0].result.bids});
            that.setState({...that.state, asks: obj.notifications[0].result.asks});
            that.setState({...that.state, instrumentAskIv: obj.notifications[0].result.askIv});
            that.setState({...that.state, instrumentBidIv: obj.notifications[0].result.bidIv});
            that.setState({...that.state, instrumentDelta: obj.notifications[0].result.delta});
            that.setState({...that.state, instrumentLastPrice: obj.notifications[0].result.last})
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
        "instrument": [instrument],
        "event": ["order_book"]
      };
      var obj = {
        "id": 5232,
        "action": "/api/v1/private/unsubscribe",
        "arguments": args,
        sig: restClient.generateSignature("/api/v1/private/subscribe", args)
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

  async computeBSM (trade_price, T, strike, vola, option_type, direction) {
    let data = [];
    let S0 = [];
    let chart_data=[];

    for (let i= parseInt(strike)-10000; i < parseInt(strike)+10000; i +=1000){
      data.push(JSON.stringify({S0: i, K:parseInt(strike), T:T, r: 0.03, sigma: vola}));
      S0.push(i)
    }
    console.log(data);
    await compute_bsm(this.props.user.token, option_type, data, direction, trade_price)
      .then(response=> {console.log(response);
        this.setState({option_values: response.data.option_values });
      });

    let y_range = [];
    for (let i=0; i<S0.length; i++) {
      chart_data.push({x: S0[i], y: (this.state.option_values[i])});
      y_range.push((this.state.option_values[i]-trade_price))
    }
    this.setState({yDomain: [Math.min(...y_range)-1000, Math.max(...y_range)+1000]});

    return chart_data;
  }

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
    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions </h4>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <h6 style={{color:"#152880"}}>Range</h6>
          <div style={{display: 'flex',  justifyContent:'left', alignItems:'left'}}>
            <IconButton onClick={()=>this.zoomIn()}>
              <ZoomIn color="secondary" />
            </IconButton>
            <IconButton onClick={()=>this.zoomOut()}>
              <ZoomOut color="secondary" />
            </IconButton>
          </div>
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"row"}}>
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
