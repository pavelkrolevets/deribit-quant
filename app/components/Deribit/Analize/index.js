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
  { dataKey: "name", title: "Name" },
  { dataKey: "sex", title: "Sex" },
  { dataKey: "city", title: "City" },
  { dataKey: "car", title: "Car" }
];
let rows = [
  { sex: "Female", name: "Sandra", city: "Las Vegas", car: "Audi A4" },
  { sex: "Male", name: "Paul", city: "Paris", car: "Nissan Altima" },
  { sex: "Male", name: "Mark", city: "Paris", car: "Honda Accord" },
  { sex: "Male", name: "Paul", city: "Paris", car: "Nissan Altima" },
  { sex: "Female", name: "Linda", city: "Austin", car: "Toyota Corolla" },
  { sex: "Male", name: "Robert", city: "Las Vegas", car: "Chevrolet Cruze" },
  { sex: "Female", name: "Lisa", city: "London", car: "BMW 750" },
  { sex: "Male", name: "Mark", city: "Chicago", car: "Toyota Corolla" },
  { sex: "Male", name: "Thomas", city: "Rio de Janeiro", car: "Honda Accord" },
  { sex: "Male", name: "Robert", city: "Las Vegas", car: "Honda Civic" },
  { sex: "Female", name: "Betty", city: "Paris", car: "Honda Civic" },
  { sex: "Male", name: "Robert", city: "Los Angeles", car: "Honda Accord" },
  { sex: "Male", name: "William", city: "Los Angeles", car: "Honda Civic" },
  { sex: "Male", name: "Mark", city: "Austin", car: "Nissan Altima" }
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
      instruments: [{'instrumentName': 'BTC-25OCT19-7500-C', 'kind': 'option', 'direction': 'buy', 'size': 3.0, 'markPrice': 0.2}],
      alert: false,
      expiration:"",
      strike: "",
      type: "C",
      size:""

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
      .then(()=>this.updateData());
  }

  async updateData(){
    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://test.deribit.com");
    await this.restClient.index()
      .then((result) => {
        console.log("Index: ", result);
        this.setState({index: result.result.btc});
        return result;
      })
      .then(() => this.computePnL())
      // .then(()=> this.restClient.getinstruments((result) => {
      //   console.log("Instruments: ", result);
      // }));
  }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  async computePnL(){
    let positions = [{'instrumentName': 'BTC-25OCT19-7500-C', 'kind': 'option', 'direction': 'buy', 'amount': 3.0}];
    let range_min = parseInt(this.state.index)-2000;
    let range_max = parseInt(this.state.index)+2000;
    let step = 100;
    analaize_positions(this.props.user.token,this.props.email, this.state.instruments, range_min, range_max, step, this.state.risk_free, this.state.vola)
      .then(result => {console.log(result.data.pnl);
        this.setState({chart_data_current: result.data.pnl,
          chart_data_at_zero: result.data.pnl_at_exp})})
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  async searchInstrument(){
    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://test.deribit.com");
    let instrument = this.state.instrument+"-"+this.state.expiration+"-"+this.state.strike+"-"+this.state.type;
    await this.restClient.getsummary(instrument)
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
    let id = this.state.instruments.length;
    if (this.state.type === "C" || this.state.type==="P") {
      this.state.instruments.push({
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
    else if (this.state.type === "") {
      this.state.instruments.push({
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
    var that = this;
    let promise = new Promise(function(resolve, reject) {
      resolve(that.state.instruments.pop());
      return null
    });
    promise.then(()=>this.computePnL());
    console.log(this.state.instruments);
    this.forceUpdate()
  }

  closeAlert(){
    this.setState({alert: false})
  }

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;

    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Analyze</h4>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="instrument-simple">Instrument</InputLabel>
            <Select
              value={this.state.instrument}
              onChange={this.handleChange("instrument")}
              inputProps={{
                name: 'instrument',
                id: 'instrument-simple',
              }}
            >
              <MenuItem value={"BTC"}>BTC</MenuItem>
              <MenuItem value={"ETH"}>ETH</MenuItem>
            </Select>
          </FormControl>

          <div style={{display: 'inline-flex', flexDirection: 'row'}}>
            <TextField
              id="input-search"
              label="Expiration"
              className="input-search"
              onChange={this.handleChange('expiration')}
              margin="normal"
              variant="filled"
              InputLabelProps={{
                shrink: true,
              }}
              style={{width: 100}}
              placeholder="25OCT19"
            />

            <TextField
              id="input-search"
              label="Strike"
              className="input-search"
              onChange={this.handleChange('strike')}
              margin="normal"
              variant="filled"
              InputLabelProps={{
                shrink: true,
              }}
              style={{width: 100}}
              placeholder="8000"
            />

            <FormControl className={classes.formControl}>
              <InputLabel >Type </InputLabel>
              <Select
                value={this.state.type}
                onChange={this.handleChange("type")}
                inputProps={{
                  name: 'direction',
                  id: 'direction-simple',
                }}
              >
                <MenuItem value={"C"}>Call</MenuItem>
                <MenuItem value={"P"}>Put</MenuItem>
                <MenuItem value={""}>Fut</MenuItem>
              </Select>
            </FormControl>

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
              variant="filled"
              InputLabelProps={{
                shrink: true,
              }}
              style={{width: 100}}
              placeholder="1"
            />
          </div>

          <div style={{display: 'inline-flex', flexDirection: 'row'}}>
            <Button
              className={classes.button}
              onClick={()=>this.searchInstrument()}
              variant="outlined"
              // color="primary"
            >Add</Button>
          </div>
          <div style={{display: 'inline-flex', flexDirection: 'row'}}>
            <Button
              className={classes.button}
              onClick={()=>this.removeInstrument()}
              variant="outlined"
              // color="primary"
            >Remove</Button>
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

        /* add gruped instruments table */

        {/*<div>*/}
          {/*<GroupedTable columns={columns} rows={rows} />*/}
        {/*</div>*/}



          /*Show list of instruments */

          <Paper>
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
                  {this.state.instruments.map(row => (
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


        /*Dialogs*/

        <Dialog
          open={this.state.alert}
          onClose={()=>this.closeAlert()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
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



      </div>
    );
  }
}


Analize.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Analize);
