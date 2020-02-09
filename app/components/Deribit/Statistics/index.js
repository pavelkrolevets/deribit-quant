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

class Stat extends Component {
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
      instruments:[],
      instrumentData:new Object(),
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
        { id: 102, strike: "3000" },
        { id: 103, strike: "4000" },
        { id: 104, strike: "5000" },
        { id: 105, strike: "6000" },
        { id: 106, strike: "7000" },
        { id: 107, strike: "8000" },
        { id: 108, strike: "9000" },
        { id: 109, strike: "10000" },
        { id: 110, strike: "11000" },
        { id: 111, strike: "12000" },
        { id: 112, strike: "13000" },
        { id: 113, strike: "14000" },
        { id: 114, strike: "15000" },
        { id: 115, strike: "16000" },
        { id: 116, strike: "17000" },
        { id: 117, strike: "18000" },
        { id: 118, strike: "19000" },
        { id: 119, strike: "20000" },
      ],
      underlying_expiration: "",

    };

  }


  async componentWillMount(){

    let token = this.props.user.token;
    let email = this.props.email;
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      resolve(get_api_keys(token, email)
        .then(result=> {console.log(result);
          that.setState({keys: result.data});
          return null;
        }))
    })
      .then(function(result) {
          return new Promise (function(resolve, reject) {
            resolve(that.updateData())
          })
        }
      );
  }

  async updateData(){
    let that = this;
    let RestClient = await require("deribit-api").RestClient;
    let restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

    restClient.index()
      .then((result) => {
        console.log("Index: ", result);
        that.setState({ index: result.result.btc });
        return result
      })
      .then(()=> {
        return that.computePnL()
      })
      .then(() => {
        return new Promise(function (resolve, reject){
          restClient.getinstruments((result) => {
            let instruments = result.result.sort((a,b) => a["kind"]>b["kind"]?1:-1);

            let futures = [];
            for (let item of instruments) {
              if (item.kind == "future"){
                futures.push(item.instrumentName);
              }
            }
            console.log("Instruments: ", futures);
            that.setState({ instruments: futures});
            resolve(instruments)
          });
        })
      })
      .then((result) => {
        that.getExpirations(result.result)}
      )
  }


  getExpirations(instruments){
    const unique = [...new Set(instruments.map(item => item.expiration))];
    let result = [];
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    for (let item of unique ){
      // if (item !== "3000-01-01 08:00:00 GMT"){
        // let formatted_date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        var date = new Date(item);
        let exp = date.getDate().toString()+monthNames[date.getMonth()]+date.getFullYear().toString().substring(2,4);
        // let jsonString = new Object();
        // jsonString[exp] = "";
        // JSON.stringify(jsonString);
        result.push({[exp]: "100"});
      // }
    }
    // result.sort((a,b)=>a.getTime()-b.getTime());
    // console.log("Result:  ", result);
    this.setState({expiration_list: result});
    console.log("Expirations", result);

  }



  handleChange = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
  };

  handleChangeCurrency = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
    if (event.target.value === 'BTC'){
      this.setState({ strike_list:
          [
            { id: 100, strike: "1000" },
            { id: 101, strike: "2000" },
            { id: 102, strike: "3000" },
            { id: 103, strike: "4000" },
            { id: 104, strike: "5000" },
            { id: 105, strike: "6000" },
            { id: 106, strike: "7000" },
            { id: 107, strike: "8000" },
            { id: 108, strike: "9000" },
            { id: 109, strike: "10000" },
            { id: 110, strike: "11000" },
            { id: 111, strike: "12000" },
            { id: 112, strike: "13000" },
            { id: 113, strike: "14000" },
            { id: 114, strike: "15000" },
            { id: 115, strike: "16000" },
            { id: 116, strike: "17000" },
            { id: 117, strike: "18000" },
            { id: 118, strike: "19000" },
            { id: 119, strike: "20000" },
          ],
      });
    }
    if (event.target.value === 'ETH'){
      this.setState({ strike_list:
          [
            { id: 100, strike: "100" },
            { id: 101, strike: "200" },
            { id: 102, strike: "300" },
            { id: 103, strike: "400" },
            { id: 104, strike: "500" },
            { id: 105, strike: "600" },
            { id: 106, strike: "700" },
            { id: 107, strike: "800" },
            { id: 108, strike: "900" },
            { id: 109, strike: "1000" },
            { id: 110, strike: "1100" },
            { id: 111, strike: "1200" },
            { id: 112, strike: "1300" },
            { id: 113, strike: "1400" },
            { id: 114, strike: "1500" },
            { id: 115, strike: "1600" },
            { id: 116, strike: "1700" },
            { id: 117, strike: "1800" },
            { id: 118, strike: "1900" },
            { id: 119, strike: "2000" },
          ],
      });
    }
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
          "instrument": ["futures"],
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
        if(data.length > 0)
        {
          var obj = JSON.parse(data);
          console.log("Data ", obj.notifications);
          if (typeof obj.notifications !== "undefined"){
            for (let item of that.state.instruments){
              if (item === obj.notifications[0].result.instrument) {
                that.setState({[item]: obj.notifications[0].result.last});
                console.log("Instrument ", that.state[item], " last " ,obj.notifications[0].result.last);
              }
            }
          }
        }
      });
    })
  }

  unsubscribe(){
    let RestClient = require("deribit-api").RestClient;
    let restClient = new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

    const WebSocket = require('ws');
    const ws = new WebSocket('wss://www.deribit.com/ws/api/v1/');

    ws.on('open', function open() {
      var args = {
        "instrument": ["futures"],
        "event": ["order_book"],
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
      .then(result=>this.State({chart_data_current: result}));
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
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>General Statistics</h4>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"row"}}>
          <Table className={classes.table} style={{maxWidth: "100%"}}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Instrument</TableCell>
                <TableCell align="left">Last</TableCell>
                <TableCell align="left">Return APR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.instruments.map(row => (
                <TableRow>
                  <TableCell align="left">
                    {row}
                  </TableCell>
                  <TableCell align="left">
                    {this.state[row]}
                  </TableCell>
                  <TableCell align="left">

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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


Stat.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Stat);
