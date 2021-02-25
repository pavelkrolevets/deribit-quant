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
// import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Modal from '@material-ui/core/Modal';

import { start_delta_hedger, get_runnign_tasks, kill_task, get_task_state, verify_api_keys} from '../../../utils/http_functions';



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
  button:{
    color:'#FFF',
    backgroundColor: 'red',
    margin: 20,
  },
  // outlinedRoot: {
  //   '&:hover $notchedOutline': {
  //     borderColor: 'red',
  //   },
  //   '&$focused $notchedOutline': {
  //     borderColor: 'green',
  //     borderWidth: 1,
  //   },
  //   '&input': {
  //     color: '#FFF'
  //   }
  // },
  // notchedOutline: {
  //   // backgroundColor: '#dc6b02',
  // },
  // focused: {
  // },
  // input: {
  //   color: '#000'
  // },

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
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal_paper: {
    position: 'center',
    width: 300,
    backgroundColor: '#000',
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  modal_error: {
    position: 'center',
    backgroundColor: '#000',
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
});

const Store = require('electron-store');
const schema = {
  token: {
    type: 'string'
  },
  email: {
    type: 'string'
  },
  api_pubkey: {
    type: 'string'
  },
  api_privkey: {
    type: 'string'
  }
};
const store = new Store({ schema });
class DeribitDeltaHedger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min_delta: '',
      max_delta: '',
      min_delta_list: [
        -1,
        -0.9,
        -0.8,
        -0.7,
        -0.6,
        -0.5,
        -0.4,
        -0.3,
        -0.2,
        -0.1,
        -0.01,
        0.01,
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1
      ],
      max_delta_list: [
        -1,
        -0.9,
        -0.8,
        -0.7,
        -0.6,
        -0.5,
        -0.4,
        -0.3,
        -0.2,
        -0.1,
        -0.01,
        0.01,
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1
      ],
      time_interval: '',
      running_tasks: [],
      stopped_tasks: [],
      selected: [],
      setSelected: [],
      instrument: 'None',
      instrument_list: [],
      currency: 'BTC'
    };
    this.update_interval = null;
  }
  async componentWillMount() {
    try {
      let keys = {};
      keys.api_pubkey = await this.getFromStore('api_pubkey');
      keys.api_privkey = await this.getFromStore('api_privkey');
      await verify_api_keys(this.props.user.token, keys.api_pubkey, keys.api_privkey);
      if (!this.props.sagas_channel_run){
        this.props.start_saga_ws();
      }
      var update_interval = setInterval(() => {
        console.log("Get instruments and positions");
       this.get_delta_hedger_tasks();
       this.get_instrument_list(this.state.currency);
       if (this.state.instrument_list.length && this.state.running_tasks.length) {
         clearInterval(update_interval);
       }
     }, 1000);
    } catch (e) {
      this.setState({ showKeysErrModal: true });
      this.setState({message: e});
          return (setTimeout(()=>{
            this.setState({showKeysErrModal: false});
            this.props.stop_saga_ws();
            this.setState({message: null});
          }, 2000));
    }
  }

  componentWillUnmount() {
    // console.log('Component unmounting...');
    if (this.update_interval) clearInterval(this.update_interval);
    // this.props.stop_saga_ws();
  }
  getFromStore(value) {
    if (store.get(value)) {
      let item = store.get(value);
      return Promise.resolve(item);
    } else {
      return Promise.reject(new Error('No value found'));
    }
  }

  get_instrument_list(currency) {
    let futures_list = [];
    if (currency === 'BTC') {
      // console.log("All instruments: ", this.props.deribit_BTC_all_instruments);
      for (let i of this.props.deribit_BTC_all_instruments) {
        if (i.kind === 'future') {
          futures_list.push(i.instrument_name);
        }
      }
      this.setState({ instrument_list: futures_list });
      // console.log("Instrument list: ", futures_list);
    }
    if (currency === 'ETH') {
      // console.log("All instruments: ", this.props.deribit_ETH_all_instruments);
      for (let i of this.props.deribit_ETH_all_instruments) {
        if (i.kind === 'future') {
          futures_list.push(i.instrument_name);
        }
      }
      this.setState({ instrument_list: futures_list });
      // console.log("Instrument list: ", futures_list);
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    // update instruemnt list depends on the currency
    if (name === 'currency') {
      this.get_instrument_list(event.target.value);
    }
  };

  checkParameters() {
    if (this.state.instrument === 'None') {
      this.setState({ message: 'Please pick active instrument' });
      this.setState({ showErrModal: true });
      return setTimeout(() => {
        this.setState({ message: null });
        return this.setState({ showErrModal: false });
      }, 2000);
    } else if (
      !this.state.min_delta ||
      !this.state.max_delta
    ) {
      this.setState({ message: 'Please set delta interval' });
      this.setState({ showErrModal: true });
      return setTimeout(() => {
        this.setState({ message: null });
        return this.setState({ showErrModal: false });
      }, 2000);
    } else if (!this.state.time_interval) {
      this.setState({ message: 'Please set time interval' });
      this.setState({ showErrModal: true });
      return setTimeout(() => {
        this.setState({ message: null });
        return this.setState({ showErrModal: false });
      }, 2000);
    } else {
      return this.setState({ showGetModal: true });
    }
  }

  async start_hedger() {
    // console.log(this.props.user.token, this.props.email);
    start_delta_hedger(
      this.props.user.token,
      this.props.email,
      this.state.min_delta,
      this.state.max_delta,
      this.state.time_interval,
      this.state.currency,
      this.state.instrument,
      this.state.api_keys_password
    )
      .then(result => {
        // console.log(result);
        this.get_delta_hedger_tasks();
        this.setState({ showGetModal: false });
      })
      .catch( e => {
        this.setState({
          message: e.response.status + ' ' + e.response.data.message
        });
        return setTimeout(() => {
          this.setState({ showGetModal: false });
          this.setState({ message: null });
        }, 2000);
      });
  }
  async get_delta_hedger_tasks() {
    get_runnign_tasks(this.props.user.token, this.props.email, true).then(
      result => {
        // console.log(result);
        this.setState({ running_tasks: result.data });
      }
    );
    get_runnign_tasks(this.props.user.token, this.props.email, false).then(
      result => {
        // console.log(result);
        this.setState({ stopped_tasks: result.data });
      }
    );
    this.forceUpdate();
  }

  async handleClick(event, name) {
    // console.log(name);
    await kill_task(this.props.user.token, this.props.email, name).then(
      result => {
        // console.log(result);
        this.get_delta_hedger_tasks();
        this.forceUpdate();
      }
    );
  }

  async getTaskState(event, name) {
    await get_task_state(this.props.user.token, this.props.email, name).then(
      result => {
        // console.log(result);
      }
    );
  }

  render() {
    const { classes } = this.props;
    const modalGetBody = (
      <div className={classes.modal_paper}>
        <h4 id="simple-modal-title">Please enter password</h4>
        <TextField
          id="input-api_keys_password"
          label="Password"
          className="input-key"
          onChange={this.handleChange('api_keys_password')}
          margin="normal"
          variant="filled"
          type="password"
          fullWidth
          InputProps={{
            classes: {
              root: classes.filledRoot,
              input: classes.input,
              focused: classes.focused
            }
          }}
          InputLabelProps={{
            classes: {
              root: classes.filledLabelRoot,
              focused: classes.focused
            }
          }}
        />
        <Button
          className={classes.button}
          onClick={() => this.start_hedger()}
          variant="contained"
          // color="primary"
        >
          Ok
        </Button>
        <Button
          className={classes.button}
          onClick={() => this.setState({ showGetModal: false })}
          variant="contained"
          // color="primary"
        >
          Calcel
        </Button>
        <h4 id="simple-modal-title">{this.state.message}</h4>
      </div>
    );

    const modalErrBody = (
      <div className={classes.modal_error}>
        <h4 id="simple-modal-title">Error: {this.state.message} </h4>
      </div>
    );
    const modalKeysErr = (
      <div className={classes.modal_paper}>
        <h4 id="simple-modal-title">
          There is no API keys are present locally. Please retrieve/update at "Profile"
        </h4>
        <Button
          className={classes.button}
          onClick={() => {
            this.setState({ showKeysErrModal: false });
            this.props.history.push('/profile');
          }}
          variant="contained"
          // color="primary"
        >
          Ok
        </Button>
        <h4 id="simple-modal-title">{this.state.message}</h4>
      </div>
    );
    return (
      <div className={classes.root}>
        <h1 className={classes.title}>Delta Hedger</h1>
        <div className={classes.inputGroup}>
          <TextField
            value={this.state.currency}
            label="Currency"
            className={classes.textField}
            onChange={this.handleChange('currency')}
            variant="filled"
            margin="normal"
            select
            helperText="Please select your currency"
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              }
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              }
            }}
          >
            <MenuItem key={'BTC'} value={'BTC'}>
              BTC
            </MenuItem>
            <MenuItem key={'ETH'} value={'ETH'}>
              ETH
            </MenuItem>
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
              }
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              }
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

        <h4 className={classes.mainText}>Select delta bands</h4>

        <div className={classes.inputGroup}>
          <TextField
            value={this.state.min_delta}
            label="Min delta"
            className={classes.textField}
            onChange={this.handleChange('min_delta')}
            variant="filled"
            margin="normal"
            select
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              }
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              }
            }}
          >
            <MenuItem value="None">
              <em>None</em>
            </MenuItem>
            {this.state.min_delta_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>

          <div className={classes.inputGroup}>
            <TextField
              id="outlined-name"
              type="number"
              label="Time interval"
              className={classes.textField}
              onChange={this.handleChange('time_interval')}
              margin="normal"
              variant="filled"
              inputProps={{ min: 0, style: { textAlign: 'center' } }}
              InputProps={{
                classes: {
                  root: classes.filledRoot,
                  input: classes.input,
                  focused: classes.focused
                }
              }}
              InputLabelProps={{
                classes: {
                  root: classes.filledLabelRoot,
                  focused: classes.focused
                }
              }}
            />
          </div>

          <TextField
            value={this.state.max_delta}
            label="Max delta"
            className={classes.textField}
            onChange={this.handleChange('max_delta')}
            variant="filled"
            margin="normal"
            select
            InputProps={{
              classes: {
                root: classes.filledRoot,
                input: classes.input,
                focused: classes.focused
              }
            }}
            InputLabelProps={{
              classes: {
                root: classes.filledLabelRoot,
                focused: classes.focused
              }
            }}
          >
            <MenuItem value="None">
              <em>None</em>
            </MenuItem>
            {this.state.max_delta_list.map((item, i) => {
              return (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              );
            })}
          </TextField>
        </div>

        <div className={classes.inputGroup}>
          <Button
            className={classes.start_button}
            onClick={() => this.checkParameters()}
            variant="contained"
            // color="primary"
          >
            Start
          </Button>
        </div>

        <div className={classes.running_tasks}>
          <h4 style={{ color: '#C0C0C0' }}>List of running tasks</h4>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Edit
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Instrument
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Interval
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Dmin
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Dmax
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  is_running
                </TableCell>
                {/*<TableCell align="center">PID</TableCell>*/}
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Timestamp
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.running_tasks.map(row => (
                <TableRow
                  key={row.id}
                  // onClick={event => this.handleClick(event, row.pid)}
                  selected
                  hover
                >
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    <IconButton
                      onClick={() => this.handleClick(event, row.pid)}
                    >
                      <DeleteIcon color="secondary" />
                    </IconButton>
                    {/*<IconButton onClick={()=>this.getTaskState(event, row.pid)}>*/}
                    {/*  <QuestionAnswer color="primary" />*/}
                    {/*</IconButton>*/}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.instrument}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.timeinterval}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.delta_min}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.delta_max}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.is_run.toString()}
                  </TableCell>
                  {/*<TableCell align="center">*/}
                  {/*  {row.pid}*/}
                  {/*</TableCell>*/}
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/*  List of stopped tasks*/}

        <div className={classes.stopped_tasks}>
          <h4 style={{ color: '#C0C0C0' }}>Task history</h4>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Instrument
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Interval
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Dmin
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Dmax
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  is_running
                </TableCell>
                {/*<TableCell align="center">PID</TableCell>*/}
                <TableCell align="center">Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.stopped_tasks.map(row => (
                <TableRow
                  key={row.id}
                  // onClick={event => this.handleClick(event, row.pid)}
                  selected
                  hover
                >
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.instrument}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.timeinterval}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.delta_min}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.delta_max}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.is_run.toString()}
                  </TableCell>
                  {/*<TableCell align="center">*/}
                  {/*  {row.pid}*/}
                  {/*</TableCell>*/}
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Modal
          className={classes.modal}
          open={this.state.showGetModal}
          // onClose={()=>this.updateUserKeys()}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {modalGetBody}
        </Modal>
        <Modal
          className={classes.modal}
          open={this.state.showErrModal}
          // onClose={()=>this.updateUserKeys()}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {modalErrBody}
        </Modal>
        <Modal
          className={classes.modal}
          open={this.state.showKeysErrModal}
          // onClose={()=>this.updateUserKeys()}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {modalKeysErr}
        </Modal>
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
