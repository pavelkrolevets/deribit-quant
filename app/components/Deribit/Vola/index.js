// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
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
import {
  compute_bsm,
  get_api_keys,
  compute_pnl,
  get_hist_vola
} from '../../../utils/http_functions';

const styles = theme => ({
  root: {
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  chart: {},
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 100
  },
  dense: {
    marginTop: 19
  },
  menu: {
    width: 200
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
});

class Vola extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current: [],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      yDomain: [0, 2],
      keys: {},
      positions: [],
      index: 0,
      account: [],
      time: new Date().toLocaleTimeString(),
      range_min: '',
      range_max: '',
      step: '',
      risk_free: '',
      vola: '',
      hist_vola: [],
      window: 21,
      timeframe: '1d',
      instrument: 'BTC'
    };
    this.update_interval = null;
  }

  async componentWillMount() {
    await get_api_keys(this.props.user.token, this.props.email).then(result => {
      console.log(result);
      this.setState({ keys: result.data });
    });

    await this.updateVola();
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
    this.update_interval = setInterval(
      async function() {
        await this.updateVola();
      }.bind(this),
      5000
    );

    // setInterval(() => {
    //   this.plot();
    //   this.updateData();
    //   this.setState({time: new Date().toLocaleTimeString()})
    // }, 30000);
  }

  componentWillUnmount() {
    console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
  }

  async updateVola() {
    await get_hist_vola(
      this.props.user.token,
      this.props.email,
      this.state.window,
      this.state.timeframe,
      this.state.instrument
    ).then(result => {
      console.log(result);
      // let vola = [];
      // for (let i of result.data.hist_vola){
      //   console.log(JSON.parse(JSON.stringify(i)).x);
      //   // console.log(i.x);
      //   let date = new Date(parseInt(i.x) * 1000);
      //   vola.push({"x": date, "y": parseInt(i.y)});
      //   // console.log({"x": date, "y": parseInt(i.y)});
      // }
      // // console.log(vola);
      this.setState({ hist_vola: result.data.hist_vola });
    });
  }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.state.hist_vola[index]] });
  };

  handleChange = name => event => {
    console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
    this.updateVola();
  };

  render() {
    const { classes } = this.props;
    const { useCanvas } = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let { yDomain } = this.state;
    return (
      <div
        data-tid="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <h4 style={{ color: '#152880' }}>Historical volatility</h4>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Instrument</InputLabel>
            <Select
              value={this.state.instrument}
              onChange={this.handleChange('instrument')}
              inputProps={{
                name: 'instrument',
                id: 'instruemnt-simple'
              }}
            >
              <MenuItem value={'BTC'}>BTC</MenuItem>
              <MenuItem value={'ETH'}>ETH</MenuItem>
            </Select>
          </FormControl>
          <TextField
            id="outlined-name"
            label="Window"
            className={classes.textField}
            onChange={this.handleChange('window')}
            margin="normal"
            variant="outlined"
            defaultValue={21}
          />

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="timeframe-simple">Timeframe</InputLabel>
            <Select
              value={this.state.timeframe}
              onChange={this.handleChange('timeframe')}
              inputProps={{
                name: 'timeframe',
                id: 'timeframe-simple'
              }}
            >
              <MenuItem value={'1m'}>Minutes</MenuItem>
              <MenuItem value={'1h'}>Hourly</MenuItem>
              <MenuItem value={'1d'}>Daily</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/*Main graph*/}
          <XYPlot
            width={700}
            height={500}
            onMouseLeave={this._onMouseLeave}
            {...{ yDomain }}
          >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis on0={true} />
            <YAxis on0={true} />
            <ChartLabel
              text="Time"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.025}
              yPercent={1.01}
            />

            <ChartLabel
              text="Volatility"
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
              data={this.state.hist_vola}
            />
            {/*<LineSeries data={this.state.chart_data_at_zero} />*/}
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
      </div>
    );
  }
}

Vola.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Vola);
