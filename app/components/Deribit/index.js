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
import { compute_bsm } from '../../utils/http_functions';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

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

  async computeBSM (){
    let data = [];
    for (let i=0; i<200; i+10){
      data.push(JSON.stringify({S0: i, K:120, T:0.3, r: 0.03, sigma: 0.7}))
    }
    await compute_bsm(this.props.user.token, 'call', data)
      .then(response=> console.log(response))
  }

  render() {
    const {classes} = this.props;
    return (
      <div data-tid="container">
        <h1 style={{color:"#152880"}}>Option positions.</h1>
        <div>
          <XYPlot
            width={300}
            height={300}>
            <HorizontalGridLines />
            <LineSeries
              data={[
                {x: 1, y: 10},
                {x: 2, y: 5},
                {x: 3, y: 15}
              ]}/>
            <XAxis />
            <YAxis />
          </XYPlot>
        </div>
        <Button
          className={classes.button}
          onClick={()=>this.computeBSM()}
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
