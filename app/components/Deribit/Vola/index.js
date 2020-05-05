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
    width: 120,
    backgroundColor: '#FF9A00',
  },
  dense: {
    marginTop: 19
  },
  menu: {
    width: 200
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    backgroundColor: '#FF9A00',
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
  }

  async componentDidMount() {
    this.props.start_hist_vola();
    // this.computeyDomain(this.props.hist_vola_data.data.hist_vola)
  }

  componentWillReceiveProps(nextProps: Props) {
    this.computeyDomain(this.props.hist_vola_data.data.hist_vola);
    this.setState({hist_vola: this.props.hist_vola_data.data.hist_vola})
  }


  computeyDomain(array){
    let yDomain =[];
    let ySeries = [];
    for (let i of array) {
      // console.log("Y", i.y);
      if (typeof i.y === 'number'){
        ySeries.push(i.y)
      }
    }
    let min = ()=> {if (Math.min(...ySeries) !==Infinity){return Math.min(...ySeries)}else{return 0}};
    let max = ()=> {if (Math.max(...ySeries) !==-Infinity){return Math.max(...ySeries)}else{return 2}};
    yDomain = [min(), max()];
    this.setState({yDomain: yDomain})
  }

  componentWillUnmount() {
    console.log('Component unmounting...');
    this.props.stop_hist_vola()
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

  };

  handleWindowChange = name => event => {
    // this.setState({ [name]: event.target.value });
    this.props.set_hist_vola_window(parseInt(event.target.value))
  };
  handleTimeframeChange = name => event => {
    // this.setState({ [name]: event.target.value });
    this.props.set_hist_vola_timeframe(event.target.value)
  };
  handleCurrencyChange = name => event => {
    // this.setState({ [name]: event.target.value });
    this.props.set_hist_vola_currency(event.target.value)
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
          flexDirection: 'column',
          backgroundColor: 'black',
        }}
      >
        <h4 style={{ color: '#FFF' }}>Historical volatility</h4>
        <div
          style={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Instrument</InputLabel>
            <Select
              value={this.props.hist_vola_currency}
              onChange={this.handleCurrencyChange('instrument')}
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
            onChange={this.handleWindowChange('window')}
            margin="normal"
            variant="outlined"
            defaultValue={21}
          />

          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="timeframe-simple">Timeframe</InputLabel>
            <Select
              value={this.props.hist_vola_timeframe}
              onChange={this.handleTimeframeChange('timeframe')}
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
            height={480}
            width={window.innerWidth * 0.85}
            margin={{left: 100, bottom: 100}}
            onMouseLeave={this._onMouseLeave}
            {...{ yDomain }}
          >
            {/*<HorizontalGridLines />*/}
            {/*<VerticalGridLines />*/}
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
              // data={this.state.hist_vola}
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
  classes: PropTypes.object.isRequired,
  email: PropTypes.string,
  user: PropTypes.object,
  token: PropTypes.string,
  hist_vola_currency: PropTypes.string,
  hist_vola_window: PropTypes.number,
  hist_vola_timeframe: PropTypes.string,
  start_hist_vola: PropTypes.func,
  stop_hist_vola: PropTypes.func,
  set_hist_vola_currency: PropTypes.func,
  set_hist_vola_timeframe: PropTypes.func,
  set_hist_vola_window: PropTypes.func,
  hist_vola_data: PropTypes.object
};

export default withStyles(styles)(Vola);
