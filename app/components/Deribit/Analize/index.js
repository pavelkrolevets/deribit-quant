// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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
      risk_free:'',
      vola:''
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
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://test.deribit.com");

    await this.restClient.positions((result) => {
      console.log("Positions: ", result.result);
      this.setState({positions: result.result});
      let strike = this.getStrike(this.state.positions[0].instrument);
      console.log(strike);
      this.computePnL();
    });

    await this.restClient.index((result) => {
      console.log("Index: ", result);
      this.setState({index: result.result.btc})
    });

    await this.restClient.account((result) => {
      console.log("Account: ", result.result);
      this.setState({account: [result.result]});
    });

    await this.restClient.getsummary("BTC-27SEP19-12500-C", (result) => {
      console.log("Instrument summary: ", result.result);
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
    let range_min = parseInt(this.state.index)-2000;
    let range_max = parseInt(this.state.index)+2000;
    let step = 100;
    let risk_free = 0.03;
    let vola = 0.8;
    compute_pnl(this.props.user.token,this.props.email, range_min, range_max, step, risk_free, vola)
      .then(result => {console.log(result.data.pnl);
        this.setState({chart_data_current: result.data.pnl,
          chart_data_at_zero: result.data.pnl_at_exp})})
  }

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions </h4>
        <div>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Equity</TableCell>
                <TableCell align="center">Global delta</TableCell>
                <TableCell align="center">Index</TableCell>
                <TableCell align="center">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.account.map((row, i) => (
                <TableRow key={i}
                >
                  <TableCell align="center">
                    {parseFloat(row.equity).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {parseFloat(row.deltaTotal).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    {this.state.index}
                  </TableCell>
                  <TableCell align="center">
                    {this.state.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                    <TableRow key={i}
                      // onClick={event => this.handleClick(event, row.pid)}
                              selected
                              hover
                    >
                      <TableCell align="center">
                        {row.instrument}
                      </TableCell>
                      <TableCell align="center">
                        {parseFloat(row.amount).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        {row.direction}
                      </TableCell>
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

        {/*<Button*/}
        {/*className={classes.button}*/}
        {/*onClick={()=>this.computePnL()}*/}
        {/*variant="outlined"*/}
        {/*// color="primary"*/}
        {/*>Compute</Button>*/}
        <br/>
      </div>
    );
  }
}


Analize.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Analize);
