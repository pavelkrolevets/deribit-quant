// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
      postions: []
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
  }


  async updateData(){

    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://test.deribit.com");

    await this.restClient.index((result) => {
      console.log("Index: ", result);
      this.setState({index: result.result.btc});
      this.computePnL(result.result.btc);
    });
  }

  async componentDidMount() {
    await get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({keys: result.data});
      });

    await this.updateData();
  }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  async computePnL(index){
    let positions = [{'instrument': 'BTC-25OCT19-7500-C', 'kind': 'option', 'averagePrice': 0.0835, 'averageUsdPrice': 667.309455, 'direction': 'buy', 'size': 3.0, 'amount': 3.0, 'floatingPl': 8.113e-06, 'floatingUsdPl': 1402.597407614, 'realizedPl': 0.0, 'markPrice': 0.023936969131174195, 'indexPrice': 8345.96, 'maintenanceMargin': 0.296810907, 'initialMargin': 0.371810907, 'settlementPrice': 0.023939673376509495, 'delta': 0.69037, 'openOrderMargin': 0.0, 'profitLoss': 0.178689093}];
    let range_min = parseInt(index)-2000;
    let range_max = parseInt(index)+2000;
    let step = 100;
    analaize_positions(this.props.user.token,this.props.email, positions, range_min, range_max, step, this.state.risk_free, this.state.vola)
      .then(result => {console.log(result.data.pnl);
        this.setState({chart_data_current: result.data.pnl,
          chart_data_at_zero: result.data.pnl_at_exp})})
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Analize</h4>



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
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>

          <TextField
            id="outlined-name"
            label="Vola"
            className={classes.textField}
            onChange={this.handleChange('vola')}
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="outlined-name"
            label="Risk free"
            className={classes.textField}
            onChange={this.handleChange('risk_free')}
            margin="normal"
            variant="outlined"
          />
        </div>
        <Button
          className={classes.button}
          onClick={()=>this.computePnL(this.state.index)}
          variant="outlined"
          // color="primary"
        >Recalculate</Button>
      </div>
    );
  }
}


Analize.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Analize);
