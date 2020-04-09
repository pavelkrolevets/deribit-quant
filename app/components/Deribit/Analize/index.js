// @flow
import { forwardRef } from 'react';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import GroupedTable from "./instrumentTable";
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';
import MaterialTable from "material-table";
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import AddIcon from '@material-ui/icons/Add';
import InstrumentTable from "./instrumentTable"
import TableSortLabel from '@material-ui/core/TableSortLabel';

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
import { compute_bsm, get_api_keys, compute_pnl, analaize_positions } from '../../../utils/http_functions';

const columns = [
  { dataKey: "baseCurrency", title: "BaseCurrency" },
  // { dataKey: "created", title: "Created" },
  // { dataKey: "currency", title: "Currency" },
  // { dataKey: "expiration", title: "Expiration" },
  { dataKey: "instrumentName", title: "InstrumentName" },
  // { dataKey: "isActive", title: "IsActive" },
  { dataKey: "kind", title: "Kind" },
  // { dataKey: "minTradeAmount", title: "MinTradeAmount" },
  // { dataKey: "minTradeSize", title: "MinTradeSize" },
  { dataKey: "optionType", title: "OptionType" },
  // { dataKey: "pricePrecision", title: "PricePrecision" },
  // { dataKey: "settlement", title: "Settlement" },
  { dataKey: "strike", title: "Strike" },
  // { dataKey: "tickSize", title: "TickSize" },

];

// let columns = [
//   { title: "BaseCurrency", field: "baseCurrency", defaultGroupOrder: 1},
//   { title: "Expiration", field: "expiration",defaultGroupOrder: 2},
//   { title: "InstrumentName", field: "instrumentName"},
//   { title: "Kind", field: "kind", defaultGroupOrder: 0},
//   { title: "OptionType", field: "optionType", defaultGroupOrder: 3},
//   { title: "Strike", field: "strike" },
//
// ];

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};


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

function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

class Analize extends Component {
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
      index: 0,
      account: [],
      time: new Date().toLocaleTimeString(),
      range_min:'',
      range_max:'',
      step:'',
      risk_free:'0.03',
      vola:'0.8',
      postions: [],
      instrument: "BTC",
      direction: "buy",
      add_instruments: [],
      alert: false,
      expiration:"",
      strike: "",
      type: "call",
      size:"",
      instruments:"",
      buySellDialog: false,
      zoom: 1.2,
      width: 0,
      height: 0,
      expirations: [],
      puts: [],
      calls:[],
      futures: [],
      options: [],
      instrumentData:[],
      bids: [],
      asks: [],
      instrumentAskIv: "",
      instrumentBidIv: "",
      instrumentDelta: "",
      instrumentLastPrice: ""

    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  componentWillMount(){

    // this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
    // this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
    // this.web3.eth.getAccounts(function (error, res) {
    //   if (!error) {
    //     console.log(res);
    //   } else {
    //     console.log(error);
    //   }
    // });

    window.removeEventListener('resize', this.updateWindowDimensions);
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
      )
  }

  componentDidMount(){
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  async updateData(){
    let that = this;
    // let RestClient = await require("deribit-api").RestClient;
    // let restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

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
            let instruments = result.result.sort((a,b) => a["strike"]>b["strike"]?1:-1);
            console.log("Instruments: ", instruments);
            that.setState({ instruments: instruments});
            resolve(result)
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
    for (let item of unique ){
      if (item !== "3000-01-01 08:00:00 GMT"){
        // let formatted_date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        result.push(item);
      }
    }
    // result.sort((a,b)=>a.getTime()-b.getTime());
    // console.log("Result:  ", result);
    this.setState({expirations: result})
  }

  getCalls(){

  }

  // sortInstruments(){
  //   for (let item in this.state.instrument_symbols){
  //     console.log(item);
  //     this.state.sorted_instruments.push({instrumentName: item.instrumentName, strike: this.getStrike(item.instrumentName),
  //       expiration: this.getExpiration(item.instrumentName), type: this.getType(item.instrumentName), baseCurrency: item.baseCurrency,})
  //   }
  //
  // }
  //
  // getStrike(instrument){
  //   let parsed_string = instrument.split('-');
  //   return parsed_string[2]
  // }
  //
  // getType(instrument){
  //   let parsed_string = instrument.split('-');
  //   return parsed_string[3]
  // }
  // getExpiration(instrument){
  //   let parsed_string = instrument.split('-');
  //   return parsed_string[1]
  // }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  async computePnL(){
    let range_min = 10;
    let range_max = parseInt(this.state.index)+parseInt(this.state.index)*this.state.zoom;
    // if (parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom < 0){
    //     range_min = 0;
    // }
    // else {
    //   range_min = parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom;
    // }

    let step = 100;
    analaize_positions(this.props.user.token,this.props.email, this.state.add_instruments, range_min, range_max, step, this.state.risk_free, this.state.vola)
      .then(result => {console.log(result.data.pnl);
        this.setState({chart_data_current: result.data.pnl,
          chart_data_at_zero: result.data.pnl_at_exp})})
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  getInstrumentFromChild = (instrument) => {
    console.log(instrument);
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.setState({instrument: instrument.instrumentName, kind: instrument.kind, type: instrument.optionType}));
      return null
    });
    promise.then(()=>this.setState({buySellDialog: true}));
  };

  async searchInstrument(){
    console.log("Adding instrument: ", this.state.instrument);
    // let RestClient = await require("deribit-api").RestClient;
    // this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);
    // let instrument = this.state.instrument+"-"+this.state.expiration+"-"+this.state.strike+"-"+this.state.type;

    await this.restClient.getsummary(this.state.instrument)
      .then(response => {
        console.log(response);
        if (response.success === true) {
          console.log(response.result);
          return this.addInstrument(response.result);
        } else {
          console.log('Wrong instrument');
          return this.setState({alert:true});
        }
      })
      .then(()=> {
        this.setState({buySellDialog: false});
        this.computePnL();
        this.unsubscribe(this.state.instrument)
      })
    // .catch(error => {
    //   this.setState({alert:true});
    //   console.log(error.response)
    // });
  }

  unsubscribe(instrument){
    // let RestClient = require("deribit-api").RestClient;
    // let restClient = new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, deribit_http);

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

  addInstrument(instrument){
    console.log("Before adding state", this.state.type, this.state.size);
    let id = this.state.add_instruments.length;
    if (this.state.type === "call" || this.state.type==="put") {
      this.state.add_instruments.push({
        id,
        instrumentName: instrument.instrumentName,
        markPrice: instrument.markPrice,
        askPrice: instrument.askPrice,
        bidPrice: instrument.bidPrice,
        last: instrument.last,
        openInterest: instrument.openInterest,
        direction: this.state.direction,
        size: this.state.size,
        kind:"option"
      });
    }
    else if (this.state.kind === "future") {
      this.state.add_instruments.push({
        id,
        instrumentName: instrument.instrumentName,
        markPrice: instrument.markPrice,
        askPrice: instrument.askPrice,
        bidPrice: instrument.bidPrice,
        last: instrument.last,
        openInterest: instrument.openInterest,
        direction: this.state.direction,
        size: this.state.size,
        kind:"future"
      });
    }
    this.forceUpdate()
  }
  removeInstrument(){
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.state.add_instruments.pop());
      return null
    });
    promise.then(()=>this.computePnL());
    console.log(this.state.add_instruments);
    this.forceUpdate()
  }

  closeAlert(){
    this.setState({alert: false})
  }
  closeBuySellDialog(){
    this.setState({buySellDialog: false})
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

  getTables(data){
    console.log(data);
    const grouped = groupBy(this.state.instruments, item => item.expiration).get(data);
    let groupedByCurrency = groupBy(grouped, item => item.baseCurrency).get("BTC");
    let groupedByOption = groupBy(groupedByCurrency, item => item.kind).get("option");
    let groupedByFuture = groupBy(groupedByCurrency, item => item.kind).get("future");
    let groupedByCalls = groupBy(groupedByOption, item => item.optionType).get("call");
    let groupedByPuts = groupBy(groupedByOption, item => item.optionType).get("put");
    this.setState({calls: groupedByCalls});
    this.setState({puts: groupedByPuts});
    this.setState({options: groupedByOption});
    this.setState({futures: groupedByFuture});
  }

  async addToPositions(instrument){
    console.log("Adding instrument", instrument);
    let that = this;
    new Promise(function(resolve, reject) {
      resolve(instrument);
      return that.setState({instrument: instrument});
    })
      .then((instrument)=> that.getWebsocketsData(instrument))
      // .then(()=> that.getInstrument())
      .then(()=>{
        that.setState({buySellDialog: true})})
  }


  async getInstrument(){
    let that =this;
    return new Promise(function(resolve, reject) {
      // let RestClient = require("deribit-api").RestClient;
      that.restClient = new RestClient(that.state.keys.api_pubkey, that.state.keys.api_privkey, deribit_http);
        that.restClient.getsummary(that.state.instrument)
        .then(response => {
          if (response.success === true) {
            console.log("Instrument", response.result);
            resolve(response.result);
          } else {
            console.log('Wrong instrument');
            resolve(that.setState({alert:true}));
          }
        });
    })

  }

  getWebsocketsData(instrument){
    console.log("Instrument", instrument);
    let that=this;
    return new Promise(function(resolve, reject) {
      // let RestClient = require("deribit-api").RestClient;
      // let restClient = new RestClient(that.state.keys.api_pubkey, that.state.keys.api_privkey, deribit_http);

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

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    let {instruments} = this.state;
    let searchInstrument = this.getInstrumentFromChild;
    let state = this.state;

    function getPutCallBySrike(instruments, strike){
      let instrument =  instruments.filter(function(item) {
        return item.strike == strike;
      });
      return instrument[0].instrumentName
    }

    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Analyze</h4>
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


        /*Show list of added instruments */

        <Paper>
          <div style={{display: 'inline-flex', flexDirection: 'row'}}>
            <Button
              className={classes.button}
              onClick={()=>this.removeInstrument()}
              variant="outlined"
              // color="primary"
            >Remove</Button>
          </div>
          <div>
            <Table className={classes.table} style={{maxWidth: "100%"}}>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Instrument</TableCell>
                  <TableCell align="left">MarkPrice</TableCell>
                  <TableCell align="left">askPrice</TableCell>
                  <TableCell align="left">bidPrice</TableCell>
                  <TableCell align="left">Last</TableCell>
                  <TableCell align="left">openInterest</TableCell>
                  <TableCell align="left">Direction</TableCell>
                  <TableCell align="left">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.add_instruments.map(row => (
                  <TableRow key={row.id}>
                    <TableCell align="left">
                      {row.instrumentName}
                    </TableCell>
                    <TableCell align="left">
                      {row.markPrice}
                    </TableCell>
                    <TableCell align="left">
                      {row.askPrice}
                    </TableCell>
                    <TableCell align="left">
                      {row.bidPrice}
                    </TableCell>
                    <TableCell align="left">
                      {row.last}
                    </TableCell>
                    <TableCell align="left">
                      {row.openInterest}
                    </TableCell>
                    <TableCell align="left">
                      {row.direction}
                    </TableCell>
                    <TableCell align="left">
                      {row.size}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Paper>

          {/*/!*Show avaliable instruments*!/*/}
        <br/>
        <Paper>
          <div style={{ border: '0px solid black', display: 'flex',  justifyContent:'flex-start', alignItems:'center', flexDirection:"column", width: state.width*0.8}}>
            <div style={{ border: '0px solid black', display: 'flex',  justifyContent:'flex-start', alignItems:'center', flexDirection:"row", width: state.width*0.8}}>
                      {this.state.expirations.map(row => (
                        <div key={row.id}>

                            <Button
                              className={classes.button}
                              onClick={()=>this.getTables(row)}
                              variant="outlined"
                              // color="primary"

                            >{row}</Button>

                        </div>
                      ))}

            </div>

            <div style={{ border: '0px solid black', display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column", width: state.width*0.8}}>

                  <Table size="small" className={classes.table} style={{maxWidth: "100%"}}>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{textAlign: 'center'}}>Calls</TableCell>
                        <TableCell style={{textAlign: 'center'}}>Strike</TableCell>
                        <TableCell style={{textAlign: 'center'}}>Puts</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.options.map(row => (
                        <TableRow key={row.id}>
                          <TableCell style={{textAlign: 'center'}}>
                            <IconButton onClick={()=>this.addToPositions(getPutCallBySrike(state.calls, row.strike))}>
                              <AddIcon color="secondary" />
                            </IconButton>
                            {getPutCallBySrike(state.calls, row.strike)}
                          </TableCell>
                          <TableCell sortDirection="asc" style={{textAlign: 'center', width: 100}}>
                            {row.strike}
                          </TableCell>
                          <TableCell style={{textAlign: 'center'}}>
                            <IconButton onClick={()=>this.addToPositions(getPutCallBySrike(state.puts, row.strike))}>
                              <AddIcon color="secondary" />
                            </IconButton>
                            {getPutCallBySrike(state.puts, row.strike)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

            </div>
          </div>
        </Paper>


        /*Dialogs*/

        <Dialog
            open={this.state.alert}
            onClose={()=>this.closeAlert()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Error"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Cant find instrument. Try another.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>this.closeAlert()} color="primary" autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>


          {/*Buy/Sell dialog*/}
          /*Dialogs*/

          <Dialog
            open={this.state.buySellDialog}
            onClose={()=>this.closeBuySellDialog()}
          >
            <DialogTitle id="buySell-dialog-title">{"Chose buy.sell.amount"}</DialogTitle>
            <DialogContent>
              <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
                <h4>Choose amount and direction.</h4>
                <h6>Last price will be used for calculation.</h6>
              </div>

              <div style={{display: 'flex',  justifyContent:'space-evenly', alignItems:'center', flexDirection:"row"}}>
                <FormControl className={classes.formControl}>
                  <InputLabel htmlFor="direction-simple">Direction</InputLabel>
                  <Select
                    value={this.state.direction}
                    onChange={this.handleChange("direction")}
                    inputProps={{
                      name: 'direction',
                      id: 'direction-simple',
                    }}
                  >
                    <MenuItem value={"buy"}>Buy</MenuItem>
                    <MenuItem value={"sell"}>Sell</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  id="input-search"
                  label="Amount"
                  className="input-search"
                  onChange={this.handleChange('size')}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{width: 100}}
                  placeholder="1"
                />

                <Button
                  className={classes.button}
                  onClick={()=>this.searchInstrument()}
                  variant="outlined"
                  // color="primary"
                >Add</Button>

              </div>
              <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"row"}}>
                <Table className={classes.table} style={{maxWidth: "100%"}}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">AskIv</TableCell>
                      <TableCell align="left">BidIv</TableCell>
                      <TableCell align="left">Delta</TableCell>
                      <TableCell align="left">Last</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRow>
                        <TableCell align="left">
                          {state.instrumentAskIv}
                        </TableCell>
                        <TableCell align="left">
                          {state.instrumentBidIv}
                        </TableCell>
                        <TableCell align="left">
                          {state.instrumentDelta}
                        </TableCell>
                        <TableCell align="left">
                          {state.instrumentLastPrice}
                        </TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div data-tid="container" style={{display: 'flex',  justifyContent:'space-evenly', alignItems:'center', flexDirection:"row"}}>
                <h4>Bids</h4>
                <h4>Asks</h4>
              </div>
              <div data-tid="container" style={{display: 'flex',  justifyContent:'space-evenly', alignItems:'top', flexDirection:"row"}}>

                <Table className={classes.table} style={{maxWidth: "100%"}}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">quantity</TableCell>
                      <TableCell align="left">amount</TableCell>
                      <TableCell align="left">price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.bids.map(row => (
                      <TableRow key={row.id}>
                        <TableCell align="left">
                          {row.quantity}
                        </TableCell>
                        <TableCell align="left">
                          {row.amount}
                        </TableCell>
                        <TableCell align="left">
                          {row.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Table className={classes.table} style={{maxWidth: "100%"}}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left">quantity</TableCell>
                      <TableCell align="left">amount</TableCell>
                      <TableCell align="left">price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.asks.map(row => (
                      <TableRow key={row.id}>
                        <TableCell align="left">
                          {row.quantity}
                        </TableCell>
                        <TableCell align="left">
                          {row.amount}
                        </TableCell>
                        <TableCell align="left">
                          {row.price}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>this.closeBuySellDialog()} color="primary" autoFocus>
                Close
              </Button>
            </DialogActions>
          </Dialog>


        </div>
    );
  }
}


Analize.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Analize);
