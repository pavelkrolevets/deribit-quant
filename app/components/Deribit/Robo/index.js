import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles/index";
import { get_task_state, kill_task } from '../../../utils/http_functions';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";



const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  chart:{
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
      instrument: "None",
      instrument_list: [],
      currency: "BTC",
    };
    this.update_interval = null;
  }

  async componentWillMount(){
    this.update_interval = setInterval(() => {
      // console.log("Tick...");
      this.get_instrument_list(this.state.currency);
    }, 1000);
  }

  componentWillUnmount() {
    // console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    // update instruemnt list depends on the currency
    if (name === 'currency'){
      this.get_instrument_list(event.target.value)
    }
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
      // console.log("Instrument list: ", futures_list);
    }
    if (currency === "ETH") {
      // console.log("All instruments: ", this.props.deribit_ETH_all_instruments);
      for (let i of this.props.deribit_ETH_all_instruments){
        if (i.kind === 'future'){
          futures_list.push(i.instrument_name)
        }
      }
      this.setState({instrument_list: futures_list});
      // console.log("Instrument list: ", futures_list);
    }
  }

  render() {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <h1  className={classes.mainText}>
          Robo to serve you, sir.
        </h1>

        <div className={classes.inputGroup}>

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
            <MenuItem value="None">
              <em>None</em>
            </MenuItem>
            {this.state.instrument_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>
        </div>

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
};

export default withStyles(styles)(Robo);
