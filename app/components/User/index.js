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


const clienrNodeUrl = 'http://localhost:8545';

class Profile extends Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.captureFile=this.captureFile.bind(this);
  }

  state = {
    URL: 'Cat in the Hat',
    Price: '',
    Description: '',
    AssetsCount: '',
    AssetList: [],
    crudContractAddress:'0x7c276dcaab99bd16163c1bcce671cad6a1ec0945',
    ethAddr:'',
    ethPrivKey:'',
    balance:'',
    account:'',
    file:''

  };

  async componentWillMount() {
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    const store = new Store();
    console.log(store.get('ethAddr'));
    console.log(store.get('ethPrivKey'));
    await this.setState({ethAddr: store.get('ethAddr')});
    await this.setState({ethPrivKey: store.get('ethPrivKey')});
    this.web3.eth.getBalance(store.get('ethAddr')).then(balance => {
      this.setState({balance: this.web3.utils.fromWei(balance, 'ether')});
    });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  updateEthAccount(){
    const schema = {
      token:
        {
          type: 'string',
        },
    };
    const store = new Store({schema});
    let token = store.get('token');
    let email = this.props.email;
    console.log(token, email);
    update_eth_account(token, email, this.state.account)
      .then(parseJSON)
      .then(response => {console.log(response)});
  }

  uploadAvatar(){

  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })
  };


  fileUpload(file){
    // var fs = require('fs');
    // var request = require('request');
    //
    // var req = request.post('http://localhost:5000/api/upload_image', function (err, resp, body) {
    //   if (err) {
    //     console.log('Error!');
    //   } else {
    //     console.log('URL: ' + body);
    //   }
    // });
    // var form = req.form();
    // form.append('file', fs.createReadStream('/Users/pavelkrolevets/Downloads/WechatIMG1.jpeg'), {
    //   filename: "WechatIMG1.jpg",
    //   contentType: 'image/jpeg',
    // });
    // form.set('token', this.props.auth.token);
    // form.set('email', this.props.email);

    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    return  fetch('http://localhost:5000/api/upload_image', {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data'
      },
      body: file
    }).then(
      response => response.json()
    ).then(
      success => console.log(success) // Handle the success response object
    ).catch(
      error => console.log(error) // Handle the error response object
    );
  }

  captureFile  = (e) => {
    this.setState({file:e.target.files[0]});

  };

  render() {
    const { classes } = this.props;
    return (
      <div className='rows' >

        <h1 style={{color: "#152880"}}>Profile</h1>

          <Avatar alt="Remy Sharp" src='./assets/images/Avatar/index.jpg' className={classes.bigAvatar}/>
        <div>
          <form id="captureMedia" onSubmit={this.handleSubmit}>
            <input type="file" onChange={this.captureFile} />
            <br/>
            <button type="submit">Upload</button>
          </form>
        </div>

          <Typography variant="body1" gutterBottom color='textPrimary'>
            Account: {this.state.ethAddr} </Typography>
          <Typography variant="body1" gutterBottom color='textPrimary'>
            Private key: {this.state.ethPrivKey} </Typography>
          <Typography variant="body1" gutterBottom color='textPrimary'>
            Balance: {this.state.balance}</Typography>
        <div>
          <Button
            className={classes.button}
            onClick={()=>this.props.history.push('/wallet')}
            variant="outlined"
            // color="primary"
          >Create</Button>
          <TextField
            id="input-account"
            label="ETH address"
            className="input-account"
            onChange={this.handleChange('account')}
            margin="normal"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            className={classes.button}
            onClick={()=>this.updateEthAccount()}
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

