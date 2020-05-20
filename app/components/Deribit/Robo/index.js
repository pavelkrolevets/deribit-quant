import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles/index";
import { get_task_state, kill_task } from '../../../utils/http_functions';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import { TypeChooser } from "react-stockcharts/lib/helper";
import Chart from './Chart';
import { getData } from "./utils"

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    // width: window.innerWidth,
    height: window.innerHeight,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  chart:{
    width: window.innerWidth * 0.7,
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'row'
  },
  formControl: {
    margin: 10,
  },
  running_tasks: {
    width: window.innerWidth * 0.9,
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column'
  },
  stopped_tasks: {
    width: window.innerWidth * 0.9,
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column'
  },
  title: {
    color:'#FFF'
  },
  mainText:{
    color:'#FFF',
    marginBottom: 10
  },
  inputGroup:{
    display: 'inline-block',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'row',
    marginBottom: 10
  },
  textField:{
    textAlign: "center",
    width: 150,
    minHeight: 50,
    marginLeft: 10,
  },

  filledRoot:{
    '&:hover': {
      backgroundColor: '#FB8D28',
    },
    '&$focused': {
      backgroundColor: '#FB8D28',
    },
    backgroundColor: '#dc6b02',
    '&$input ':{
      color: '#000',
      textAlign: 'center'
    }
  },
  input:{
  },
  focused:{
  },

  filledLabelRoot:{
    '&$focused': {
      color:'red',
    },
    color:'#000'
  },

  start_button:{
    color:'#FFF',
    backgroundColor: 'red',
    margin: 20
  }

});


class Robo extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      min_delta:'',
      max_delta:'',
      min_delta_list: [-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1, -0.01],
      max_delta_list: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.01],
      time_interval:'',
      running_tasks:[],
      stopped_tasks: [],
      selected:[],
      setSelected:[],
      instrument: "BTC-PERPETUAL",
      currency: "BTC",
      exchange_list: ["Binance", "Bitmex"],
      exchange: "Deribit",
      timeframe_list: [1,
        3,
        5,
        10,
        15,
        60,
        120,
        180,
        360,
        720,
        "1D"],
      timeframe: 30,
    };
    this.update_interval = null;
    this.chart_update_interval = null;
  }
  async componentWillMount(){
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {

  }

  parseData(data){
    var arrayLength = data.ticks.length;
    let parsed_data = [];
    for (var i = 0; i < arrayLength; i++) {
      let date = new Date(data.ticks[i]);
      parsed_data.push({date: date, open: data.open[i], high: data.high[i], low: data.low[i], close: data.close[i], volume: data.volume[i] })
    }
    // console.log("Parsed data", parsed_data);
    this.setState({db_data: parsed_data})
  }

  componentWillUnmount() {
    // console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
    if (this.chart_update_interval) clearInterval(this.chart_update_interval);
  }

  componentDidMount() {
    this.update_interval = setInterval(() => {
      // console.log("Tick...");
      this.get_instrument_list(this.state.currency);

      if (typeof this.state.db_data === 'undefined'){
        console.log("Updating chart data ...");
        this.updateChartData();
      }
      // this.updateChartData();
    }, 1000);

    // this.chart_update_interval = setInterval(() =>{
    //   // update chart with historical data
    //   this.updateChartData()
    // }, 30000);

  }

  updateChartData(){
    if (this.props.derbit_tradingview_data !== null && typeof this.props.derbit_tradingview_data !== 'undefined') {
      // console.log("Chart data", this.props.derbit_tradingview_data);
      console.log("Updating chart data ...");
      this.parseData(this.props.derbit_tradingview_data)
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    // update instruemnt list depends on the currency
    if (name === 'currency'){
      this.get_instrument_list(event.target.value)
    }
    // if (name === 'instrument'){
    //   this.props.derbit_tradingview_instrument_name(event.target.value);
    // }
    // if (name === 'timeframe'){
    //   this.props.derbit_tradingview_resolution(event.target.value);
    // }
  };

  async handleClick(event, name) {
    // console.log(name);
    await kill_task(this.props.user.token, this.props.email, name)
      .then(result=> {
        // console.log(result);
        this.get_delta_hedger_tasks();
        this.forceUpdate();});
  }

  get_instrument_list(currency){
    let futures_list = [];
    if (currency === "BTC") {
      // console.log("All instruments: ", this.props.deribit_BTC_all_instruments);
      for (let i of this.props.deribit_BTC_all_instruments){
        if (i.kind === 'future'){
          futures_list.push(i.instrument_name)
        }
      }
      this.setState({instrument_list: futures_list});
      console.log("Instrument list: ", futures_list);
    }
    if (currency === "ETH") {
      // console.log("All instruments: ", this.props.deribit_ETH_all_instruments);
      for (let i of this.props.deribit_ETH_all_instruments){
        if (i.kind === 'future'){
          futures_list.push(i.instrument_name)
        }
      }
      this.setState({instrument_list: futures_list});
      console.log("Instrument list: ", futures_list);
    }
  }

  render() {
    const {classes} = this.props;
    let { db_data, instrument_list } = this.state;
    if (db_data === null || typeof db_data === 'undefined' || instrument_list === undefined) {
      return <div className={classes.root}>
        <h1  className={classes.mainText}>
        Loading...
      </h1>
      </div>
    }
    return (
      <div className={classes.root}>
        <h1  className={classes.mainText}>
          Robo
        </h1>

        <div className={classes.inputGroup}>
          <TextField
            value={this.state.exchange}
            label="Exchange"
            className={classes.textField}
            onChange={this.handleChange('exchange')}
            variant="filled"
            margin="normal"
            select
            helperText="Please select hedging instrument"
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              },
            }}
          >
            <MenuItem value="Deribit">
              <em>Deribit</em>
            </MenuItem>
            {this.state.exchange_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>


          <TextField
            value={this.state.currency}
            label="Currency"
            className={classes.textField}
            onChange={this.handleChange("currency")}
            variant="filled"
            margin="normal"
            select
            helperText="Please select your currency"
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              },
            }}
          >
            <MenuItem key={"BTC"} value={"BTC"}>BTC</MenuItem>
            <MenuItem key={"ETH"} value={"ETH"}>ETH</MenuItem>
          </TextField>

          <TextField
            value={this.state.instrument}
            label="Instrument"
            className={classes.textField}
            onChange={this.handleChange('instrument')}
            variant="filled"
            margin="normal"
            select
            helperText="Please select hedging instrument"
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              },
            }}
          >
            {/*<MenuItem value="None">*/}
            {/*  <em>None</em>*/}
            {/*</MenuItem>*/}
            {this.state.instrument_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            value={this.state.timeframe}
            label="Timeframe"
            className={classes.textField}
            onChange={this.handleChange('timeframe')}
            variant="filled"
            margin="normal"
            select
            helperText="Please select timeframe"
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              },
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              },
            }}
          >
            <MenuItem value={30}>
              <em>30</em>
            </MenuItem>
            {this.state.timeframe_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>
        </div>




          <Chart data={this.state.db_data} width={window.innerWidth * 0.9}/>


      </div>
    );
  }
}

Robo.propTypes = {
  email: PropTypes.string,
  user: PropTypes.object,
  token: PropTypes.string,

  api_pubkey: PropTypes.string,
  api_privkey: PropTypes.string,
  start_saga_ws: PropTypes.func,
  stop_saga_ws: PropTypes.func,

  deribit_BTC_index: PropTypes.number,
  deribit_BTC_futures_pos: PropTypes.array,
  deribit_BTC_options_pos: PropTypes.array,
  deribit_BTC_account_state: PropTypes.array,
  deribit_BTC_open_pos: PropTypes.array,
  deribit_BTC_all_instruments: PropTypes.array,

  deribit_ETH_index: PropTypes.number,
  deribit_ETH_account_state: PropTypes.array,
  deribit_ETH_open_pos: PropTypes.array,
  deribit_ETH_all_instruments: PropTypes.array,

  derbit_tradingview_data: PropTypes.object,
  derbit_tradingview_instrument_name: PropTypes.func,
  derbit_tradingview_resolution: PropTypes.func
};

export default withStyles(styles)(Robo);
