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
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { start_delta_hedger, get_tasks, kill_task} from '../../../utils/http_functions';



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


class DeribitDeltaHedger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min_delta:'',
      max_delta:'',
      time_interval:'',
      tasks:[],
      selected:[],
      setSelected:[]

    };
  }
  async componentWillMount(){
    this.get_delta_hedger_tasks()
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
  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  async start_hedger(){
    console.log(this.props.user.token, this.props.email);
    start_delta_hedger(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
      this.get_delta_hedger_tasks()})
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

  render() {
    const {classes} = this.props;
    return (
      <div data-tid="container">
        <h1 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Delta Hedger</h1>
        <h4 style={{color:"#C0C0C0", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Select bands</h4>
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
          <Button
            className={classes.button}
            onClick={()=>console.log("hello")}
            variant="outlined"
            // color="primary"
          >Stop</Button>
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
};

export default withStyles(styles)(DeribitDeltaHedger);
