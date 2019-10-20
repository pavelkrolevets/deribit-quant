// @flow
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
  { dataKey: "expiration", title: "Expiration" },
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


class Analize extends Component {
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
      zoom: 0.2,
    };

  }


  async componentWillMount(){

    // this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
    // this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
    // this.web3.eth.getAccounts(function (error, res) {
    //   if (!error) {
    //     console.log(res);
    //   } else {
    //     console.log(error);
    //   }
    // });

    await get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({keys: result.data});
      })
      // .then(()=>this.updateData());
  }

  componentDidMount(){
    this.updateData();
  }

  async updateData(){
    // let that = this;
    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://deribit.com");
    await this.restClient.index()
      .then((result) => {
        console.log("Index: ", result);
        this.setState({index: result.result.btc});
        return result;
      })
      .then(() => this.computePnL())
      .then(()=> this.restClient.getinstruments((result) => {
        console.log("Instruments: ", result.result);
        this.setState({instruments: result.result});
      }))
      // .then(()=> this.sortInstruments())
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
    let range_min = parseInt(this.state.index)-parseInt(this.state.index)*this.state.zoom;
    let range_max = parseInt(this.state.index)+parseInt(this.state.index)*this.state.zoom;
    console.log("Range", range_min, range_max);

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
    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://deribit.com");
    // let instrument = this.state.instrument+"-"+this.state.expiration+"-"+this.state.strike+"-"+this.state.type;
    await this.restClient.getsummary(this.state.instrument)
      .then(response => {
        console.log(response);
        if (response.success === true) {
          console.log(response.result);
          this.addInstrument(response.result);
        } else {
          console.log('Wrong instrument');
          this.setState({alert:true});
        }
      })
      .then(()=> this.computePnL())

    // .catch(error => {
    //   this.setState({alert:true});
    //   console.log(error.response)
    // });
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
    else if (this.state.type === "future") {
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
      resolve(that.setState((prevState, props) => ({zoom: prevState.zoom+0.1})));
      return null
    });
    promise.then(()=>this.computePnL());
  }
  zoomOut(){
    let that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.setState((prevState, props) => ({zoom: prevState.zoom-0.1})));
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
    let {instruments} = this.state;
    let searchInstrument = this.getInstrumentFromChild;
    function instrumentTable() {
      if (instruments.length!==0) {
        return (
          /* add gruped instruments table */
          <div>
            <GroupedTable columns={columns} rows={instruments} searchInstrument={searchInstrument}/>
          </div>
        )
      }
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
            <Table className={classes.table}>
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

          {/*<br/>*/}
          {/*<div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>*/}

          {/*<TextField*/}
          {/*id="outlined-name"*/}
          {/*label="Vola"*/}
          {/*className={classes.textField}*/}
          {/*onChange={this.handleChange('vola')}*/}
          {/*margin="normal"*/}
          {/*variant="outlined"*/}
          {/*/>*/}
          {/*<TextField*/}
          {/*id="outlined-name"*/}
          {/*label="Risk free"*/}
          {/*className={classes.textField}*/}
          {/*onChange={this.handleChange('risk_free')}*/}
          {/*margin="normal"*/}
          {/*variant="outlined"*/}
          {/*/>*/}
          {/*<Button*/}
          {/*className={classes.button}*/}
          {/*onClick={()=>this.computePnL(this.state.index)}*/}
          {/*variant="outlined"*/}
          {/*// color="primary"*/}
          {/*>Recalculate</Button>*/}
          {/*</div>*/}


          {/*Show avaliable instruments*/}
          {instrumentTable()}


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

              <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"row"}}>
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
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                className={classes.button}
                onClick={()=>this.searchInstrument()}
                variant="outlined"
                // color="primary"
              >Add</Button>
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
