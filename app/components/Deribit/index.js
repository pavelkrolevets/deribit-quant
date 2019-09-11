// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
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
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { fade } from '@material-ui/core/styles/colorManipulator';
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
import { compute_bsm } from '../../utils/http_functions';
import {curveCatmullRom} from 'd3-shape';


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


class Deribit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current:[],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      yDomain: [-20, 20]
    };
  }
  // async componentWillMount(){
  //   this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
  //   this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
  //   this.web3.eth.getAccounts(function (error, res) {
  //     if (!error) {
  //       console.log(res);
  //     } else {
  //       console.log(error);
  //     }
  //   });
  // }

  async plot(){
    await this.computeBSM(10, 0.3)
      .then(result=>this.setState({chart_data_current: result}));
    await this.computeBSM(10, 0.001)
      .then(result=>this.setState({chart_data_at_zero: result}));
  }

  async computeBSM (trade_price, T) {
    let data = [];
    let S0 = [];
    let chart_data=[];

    for (let i=0; i < 200; i += 10){
      data.push(JSON.stringify({S0: i, K:120, T:T, r: 0.03, sigma: 0.7}));
      S0.push(i)
    }
    console.log(data);
    await compute_bsm(this.props.user.token, 'call', data)
      .then(response=> {console.log(response);
      this.setState({option_values: response.data.option_values });
      });

    let y_range = [];
    for (let i=0; i<S0.length; i++) {
      chart_data.push({x: S0[i], y: (this.state.option_values[i]-trade_price)});
      y_range.push((this.state.option_values[i]-trade_price))
    }
    this.setState({yDomain: [Math.min(...y_range)-20, Math.max(...y_range)+20]});

    return chart_data;
  }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    return (
      <div data-tid="container">
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions</h4>

          <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <XYPlot width={600} height={300} onMouseLeave={this._onMouseLeave} {...{yDomain}}>
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
          </XYPlot>
          </div>

        <Button
          className={classes.button}
          onClick={()=>this.plot()}
          variant="outlined"
          // color="primary"
        >Compute</Button>

      </div>
    );
  }
}


Deribit.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Deribit);
