import React, {Component} from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
const Store = require('electron-store');
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {update_eth_account, upload_file} from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';
import axios from 'axios';
import FormData from 'form-data'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },

  bigAvatar: {
    margin: 10,
    width: 100,
    height: 100,
  },
});


class Profile extends Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
  }

  state = {
    api_pub_key:'',
    api_secret:''
  };

  async componentWillMount() {

  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  updateUserKeys(){

  }


  render() {
    const { classes } = this.props;
    return (
      <div className='rows' >

        <h1 style={{color: "#152880"}}>Profile</h1>

          <Typography variant="body1" gutterBottom color='textPrimary'>
            Account: {this.props.email} </Typography>
        <h4 style={{color: "#152880"}}>Api keys</h4>
          <Typography variant="body1" gutterBottom color='textPrimary'>
            Pub: {this.state.ethPrivKey} </Typography>
          <Typography variant="body1" gutterBottom color='textPrimary'>
            Secret: {this.state.balance}</Typography>
        <div>
          <TextField
            id="input-api_pub_key"
            label="Api key"
            className="input-key"
            onChange={this.handleChange('api_pub_key')}
            margin="normal"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            id="input-api_priv_key"
            label="Api seceret"
            className="input-key"
            onChange={this.handleChange('api_secret')}
            margin="normal"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            className={classes.button}
            onClick={()=>this.updateUserKeys()}
            variant="outlined"
            // color="primary"
          >Update</Button>
        </div>


      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);

