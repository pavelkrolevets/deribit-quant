// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import QuestionIcon from '@material-ui/icons/QueryBuilder';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';


import { start_delta_hedger, get_tasks, kill_task, get_task_state} from '../../../utils/http_functions';



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
  },
  formControl: {
    margin: theme.spacing(3),
  },
});


class DeribitDeltaHedger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min_delta:'',
      max_delta:'',
      time_interval:'',
      tasks:[],
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
      this.get_delta_hedger_tasks();
      this.get_instrument_list(this.state.currency);
    }, 1000);
  }

  componentWillUnmount() {
    console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
    // this.props.stop_saga_ws();
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


  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    // update instruemnt list depends on the currency
    if (name === 'currency'){
      this.get_instruemnt_list(event.target.value)
    }
  };

  async start_hedger(){
    console.log(this.props.user.token, this.props.email);
    if (this.state.instrument!=='None') {
      start_delta_hedger(this.props.user.token, this.props.email, this.state.min_delta, this.state.max_delta, this.state.time_interval, this.state.currency, this.state.instrument)
        .then(result => {
          console.log(result);
          this.get_delta_hedger_tasks()
        })
    } else {
      alert("Please pick active instrument")
    }
  }
  async get_delta_hedger_tasks(){
    get_tasks(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({tasks: result.data});
        this.forceUpdate();
      });

  }

  async handleClick(event, name) {
    console.log(name);
    await kill_task(this.props.user.token, this.props.email, name)
      .then(result=> {console.log(result);
        this.get_delta_hedger_tasks();
        this.forceUpdate();});
  }

  async getTaskState(event, name){
    await get_task_state(this.props.user.token, this.props.email, name)
      .then(result=> {console.log(result);})
  }

  render() {
    const {classes} = this.props;
    return (
      <div data-tid="container">
        <h1 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Delta Hedger</h1>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection: 'row'}}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="age-simple">Currency</InputLabel>
            <Select
              value={this.state.currency}
              onChange={this.handleChange("currency")}
              inputProps={{
                name: 'instrument',
                id: 'instruemnt-simple',
              }}
            >
              <MenuItem value={"BTC"}>BTC</MenuItem>
              <MenuItem value={"ETH"}>ETH</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel htmlFor="age-simple">Instrument</InputLabel>
            <Select
              value={this.state.instrument}
              onChange={this.handleChange('instrument')}
              inputProps={{
                name: 'hedging_instrument',
                id: 'hedging_instrument-simple'
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
            </Select>
          </FormControl>
        </div>
        <h4 style={{color:"#C0C0C0", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Select delta bands</h4>

        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>

          <TextField
            id="outlined-name"
            label="Min"
            className={classes.textField}
            onChange={this.handleChange('min_delta')}
            margin="normal"
            variant="outlined"
          />
          <TextField
            id="outlined-name"
            label="Max"
            className={classes.textField}
            onChange={this.handleChange('max_delta')}
            margin="normal"
            variant="outlined"
          />
        </div>
        <h4 style={{color:"#C0C0C0", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Enter time interval</h4>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <TextField
            id="outlined-name"
            label="Time interval"
            className={classes.textField}
            onChange={this.handleChange('time_interval')}
            margin="normal"
            variant="outlined"
          />
        </div>
        <br/>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <Button
          className={classes.button}
          onClick={()=>this.start_hedger()}
          variant="outlined"
          // color="primary"
        >Start</Button>
        </div>
        <div>
          <h4 style={{color:"#C0C0C0", display: 'flex',  justifyContent:'center', alignItems:'center'}}>List of running tasks</h4>
        </div>
        {/*Create a table to show account list*/}
        <Paper>
          <div>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Edit</TableCell>
                  <TableCell align="center">Instrument</TableCell>
                  <TableCell align="center">Interval</TableCell>
                  <TableCell align="center">Dmin</TableCell>
                  <TableCell align="center">Dmax</TableCell>
                  <TableCell align="center">is_running</TableCell>
                  <TableCell align="center">PID</TableCell>
                  <TableCell align="center">Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.tasks.map(row => (
                  <TableRow key={row.id}
                            // onClick={event => this.handleClick(event, row.pid)}
                            selected
                            hover
                            >
                    <TableCell align="center">
                      <IconButton onClick={()=>this.handleClick(event, row.pid)}>
                        <DeleteIcon color="secondary" />
                      </IconButton>
                      <IconButton onClick={()=>this.getTaskState(event, row.pid)}>
                        <QuestionIcon color="primary" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      {row.instrument}
                    </TableCell>
                    <TableCell align="center">
                      {row.timeinterval}
                    </TableCell>
                    <TableCell align="center">
                      {row.delta_min}
                    </TableCell>
                    <TableCell align="center">
                      {row.delta_max}
                    </TableCell>
                    <TableCell align="center">
                      {row.is_run.toString()}
                    </TableCell>
                    <TableCell align="center">
                      {row.pid}
                    </TableCell>
                    <TableCell align="center">
                      {row.timestamp}
                    </TableCell>


                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Paper>
      </div>
    );
  }
}


DeribitDeltaHedger.propTypes = {
  classes: PropTypes.object.isRequired,
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

export default withStyles(styles)(DeribitDeltaHedger);
