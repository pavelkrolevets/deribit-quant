import React, {Component} from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
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


import { search_user, add_chain, get_chain_by_user, get_user_by_chain } from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';

const Store = require('electron-store');

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
  },
  group: {
    margin: theme.spacing(1, 0),
  },
  table: {
    minWidth: 650,
  },
});

class Blockchain extends Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
  }

  state = {
    URL: 'Cat in the Hat',
    clientType: '',
    pswd: '',
    account:'',
    accounts: [],
    username: '',
    search_email:'',
    alert: false,
    blocktime: 1,
    chain_id: 1515,
    allocate_tokens: 0,
    allocate: false,
    ethAddr:'',
    ethPrivKey:''
  };

  async componentWillMount() {
    const store = new Store();
    console.log(store.get('ethAddr'));
    console.log(store.get('ethPrivKey'));
    await this.setState({ethAddr: store.get('ethAddr')});
    await this.setState({ethPrivKey: store.get('ethPrivKey')});
    console.log(this.props.user)
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  async runNode(){
    const exec = require('child_process').exec;
    function execute(command, callback) {
      exec(command, (error, stdout, stderr) => {
        callback(stdout);
      });
    }
    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    if (this.state.clientType === 'geth') {
      // Running the local node
      console.log('Running the node in tmux');
      // const addr = "0xb47f736b9b15dcc888ab790c38a6ad930217cbee";
      await execute('cd clients/go-ethereum/ && ./run.sh',
        (output) => {console.log(output);});
      // await execute('tmux send-keys -t "blockchain" "geth --datadir node1/ init genesis.json" C-m',
      //   (output) => {console.log(output);});
      await sleep(5000)
        .then(
          // connect to the node
          this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545")));
      // unlock the account
      await this.web3.eth.personal.unlockAccount(this.state.ethAddr, this.state.pswd, 0)
    }
  }

  async killNode(){
    const exec = require('child_process').exec;
    function execute(command, callback) {
      exec(command, (error, stdout, stderr) => {
        callback(stdout);
      });
    }
    if (this.state.clientType === 'geth') {
      // Running the local node
      console.log('Running the node in tmux');
      await execute('tmux kill-session -t "blockchain"',
        (output) => {console.log(output);});
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    console.log(name, event.target.value)
  };

  addAccounts(account){
    let id = this.state.accounts.length;
    console.log(this.web3.utils.toWei(this.state.allocate_tokens, 'ether'));
    let allocate_tokens = this.web3.utils.toHex(this.web3.utils.toWei(this.state.allocate_tokens, 'ether'));
    this.state.accounts.push({id, account, allocate_tokens});
    console.log(this.state.accounts);
    // let extraData = this.state.accounts.join('');
    this.forceUpdate()
  }
  removeAccounts(){
    this.state.accounts.pop();
    console.log(this.state.accounts);
    this.forceUpdate()
  }

  closeAlert(){
    this.setState({alert: false})
  }

  saveGenesis(){
    let genesisContent = {
      "config": {
        "chainId": parseInt(this.state.chain_id),
        "homesteadBlock": 1,
        "eip150Block": 2,
        "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "eip155Block": 3,
        "eip158Block": 3,
        "byzantiumBlock": 4,
        "constantinopleBlock": 5,
        "clique": {
          "period": this.state.blocktime,
          "epoch": 30000
        }
      },
      "nonce": "0x0",
      "timestamp": "0x5c429ca3",
      "extraData": "",
      "gasLimit": "0x47b760",
      "difficulty": "0x1",
      "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "coinbase": "0x0000000000000000000000000000000000000000",
      "alloc": '',
      "number": "0x0",
      "gasUsed": "0x0",
      "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    };

    let extraData ="";
    extraData = this.state.accounts.map((row) => extraData.concat(`${row.account.substring(2)}`)).join('');
    extraData = "0x0000000000000000000000000000000000000000000000000000000000000000"+extraData+"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    genesisContent['extraData'] = extraData;
    console.log(extraData);
    let alloc ={};
    function addToArray(value, index, array){
      alloc[value.account]= {"balance": value.allocate_tokens};
    }
    this.state.accounts.forEach(addToArray);
    console.log(alloc);
    genesisContent.alloc = alloc;

    add_chain(this.props.user.token, this.state.chain_id, this.props.user.userName)
      .then(response => console.log(response));

    var fs = require('fs');
    let fileName = './clients/go-ethereum/genesis.json';
      fs.writeFile(fileName, JSON.stringify(genesisContent), (err) => {
        if(err){
          alert("An error ocurred creating the file "+ err.message)
        }
        alert("The file has been succesfully saved");
      });
  }

  async getChain(){
      get_chain_by_user(this.props.user.token, this.props.user.userName)
        .then(response => console.log("Chains by user", response));
      get_user_by_chain(this.props.user.token, this.state.chain_id)
        .then(response => console.log("Users by chain", response));
  }

  addUser(){
    search_user(this.props.user.token, this.state.search_email)
      .then(parseJSON)
      .then(response => {
        console.log(response);
        if (response.status === 200) {
          this.addAccounts(response.eth_account);
        } else {
          console.log('Wrong token!');
          this.setState({alert:true});
        }
      })
      // .catch(error => {
      //   this.setState({alert:true});
      //   console.log(error.response)
      // });
  }

  render() {
    const {classes} = this.props;
    return (
      <div className="col-md-8">
        <Paper>
        <h4 style={{color: "#152880"}}>Choose client</h4>

        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Ethereum Client</FormLabel>
          <RadioGroup
            aria-label="ETHClient"
            name="ethclient1"
            className={classes.group}
            onChange={this.handleChange('clientType')}
            value={this.state.clientType}
          >
            <FormControlLabel value="geth" control={<Radio />} label="Geth" style={{color: "#000"}} />
            <FormControlLabel value="parity" control={<Radio />} label="Parity" style={{color: "#000"}}/>
          </RadioGroup>
        </FormControl>
          <h4 style={{color: "#152880"}}>Specify chain ID</h4>

          {/*Specify chain ID*/}
          <div>
            <TextField
              id="input-cahin-id"
              label="Chain ID"
              className="input-chain-id"
              onChange={this.handleChange('chain_id')}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>


          {/*Add accounts from the server*/}
          <div>
            <h4 style={{color: "#152880"}}>Add authorized to mine addresses by email search.</h4>
            <div style={{flex:1}}>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
                <TextField
                  id="input-search"
                  label="Add by email"
                  className="input-search"
                  onChange={this.handleChange('search_email')}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{width: 300}}
                />
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
                <TextField
                  id="input-alloc"
                  label="Alloc amount"
                  className="input-alloc"
                  onChange={this.handleChange('allocate_tokens')}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{width: 100}}
                />
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
                <Button
                  className={classes.button}
                  onClick={()=>this.addUser()}
                  variant="outlined"
                  // color="primary"
                >Add</Button>
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
                <Button
                  className={classes.button}
                  onClick={()=>this.removeAccounts()}
                  variant="outlined"
                  // color="primary"
                >Remove</Button>
              </div>
            </div>


            {/*Add accounts manually*/}
            <h4 style={{color: "#152880"}}>Or add authorized to mine addresses manually.</h4>
            <div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
              <TextField
                id="input-account"
                label="ETH address"
                className="input-account"
                onChange={this.handleChange('account')}
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                style={{width: 300}}
              />
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
                <TextField
                  id="input-alloc"
                  label="Alloc ETH"
                  className="input-alloc"
                  onChange={this.handleChange('allocate_tokens')}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{width: 100}}
                />
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
              <Button
                className={classes.button}
                onClick={()=>this.addAccounts(this.state.account)}
                variant="outlined"
                // color="primary"
              >Add</Button>
              </div>
              <div style={{display: 'inline-flex', flexDirection: 'row'}}>
              <Button
                className={classes.button}
                onClick={()=>this.removeAccounts()}
                variant="outlined"
                // color="primary"
              >Remove</Button>
              </div>
            </div>
        <div>


          {/*Create a table to show account list*/}
          <Paper>
            <div>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Accounts</TableCell>
                    <TableCell align="left">Allocate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.accounts.map(row => (
                    <TableRow key={row.id}>
                      <TableCell align="left">
                        {row.account}
                      </TableCell>
                      <TableCell align="left">
                        {row.allocate_tokens}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Paper>

          <br/>
          <h4 style={{color: "#152880"}}> Specify block time speed for the permissioned chain.</h4>
          <div>


            {/*Chose blocktime*/}
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="blocktime-simple">Blocktime</InputLabel>
              <Select
                value={this.state.blocktime}
                onChange={this.handleChange('blocktime')}
                inputProps={{
                  name: 'blocktime',
                  id: 'blocktime-simple',
                }}
              >
                <MenuItem value={1}>1 second</MenuItem>
                <MenuItem value={5}>5 seconds</MenuItem>
                <MenuItem value={15}>15 seconds</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/*SAVE genesis*/}
          <Button
            className={classes.button}
            onClick={()=>this.saveGenesis()}
            variant="contained"
            color="primary"
          >Save</Button>
          <Button
            className={classes.button}
            onClick={()=>this.getChain()}
            variant="contained"
            color="primary"
          >Get</Button>
        </div>

        </div>



          {/*Unlock and run*/}
          <TextField
            id="input-password"
            label="Password"
            className="input-password"
            onChange={this.handleChange('pswd')}
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <br/>


          {/*Run a node*/}
        <div>
        <Button
          className={classes.button}
          onClick={()=>this.runNode()}
          variant="contained"
          color="primary"
        >Deploy</Button>
          <Button
            className={classes.button}
            onClick={()=>this.killNode()}
            variant="outlined"
            color="primary"
          >Kill</Button>
        </div>
        </Paper>


        {/*Dialogs*/}

        <Dialog
          open={this.state.alert}
          onClose={()=>this.closeAlert()}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Account doesnt exist. Please specify right user email.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>this.closeAlert()} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>


      </div>
    );
  }
}

Blockchain.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Blockchain);

