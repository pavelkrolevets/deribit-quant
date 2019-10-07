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
  }

  getStrike(instrument){
    let parsed_string = instrument.split('-');
    return parsed_string[2]
  }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

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
