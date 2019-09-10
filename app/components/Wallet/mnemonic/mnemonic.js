import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Web3 from 'web3';
const Store = require('electron-store');
import {update_eth_account} from '../../../utils/http_functions';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  root: {
    width: '90%',
    overflow: 'scroll',
    padding: 5,
    paddingTop: 15,
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'left'
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  resetContainer: {
    padding: theme.spacing.unit * 3,
  },
});

function getSteps() {
  return ['Preapre to write down 12 words', 'Mnemonic Phrase', 'Save'];
}

function getStepContent(stepIndex, phrase, address) {
  // const listItems = phrase.map((phr, i) =>  <li id>{i}. {phr}</li>);
  // console.log(listItems);
  switch (stepIndex) {
    case 0:
      return 'WARNING! Write these words down. Do not copy them to your clipboard, or save them anywhere online.';
    case 1:
      return (<Card>
      <CardContent>
        <Typography variant="body2" gutterBottom color='textPrimary'>
          {phrase.map(txt => <p>{txt}</p>)}
        </Typography>
      </CardContent>
    </Card>);
    case 2:
      return (<Card>
        <CardContent>
          <Typography variant="body2" gutterBottom color='textPrimary'>
            Your Ethereum Address: {address} <br/>
            Private key was stored in the safe place.
          </Typography>
        </CardContent>
      </Card>);
    default:
      return 'Unknown stepIndex';
  }
}


function twoNumbers() {
  do {
    var num1 = Math.floor(Math.random() * 12);
    var num2 = Math.floor(Math.random() * 12);
  }
  while(num1 === num2);
  return [num1, num2]
}

const RandomNumber = twoNumbers();

// const testPhrase = "universe unfair review horn mansion area shallow labor subway fiscal rib quarter";

class Mnemonic extends Component {
  constructor(props) {
    super(props);
    // this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
    this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
    console.log(this.web3)
  }
  async componentWillMount() {
    const bip39 = require('bip39');
    const mnemonic = bip39.generateMnemonic();

    const magicWordsArray = mnemonic.split(" ");
    console.log(magicWordsArray);
    this.setState({
      magicWords: magicWordsArray,
      firstRandomWord: magicWordsArray[RandomNumber[0]],
      secondRandomWord: magicWordsArray[RandomNumber[1]],
      firstNumber: RandomNumber[0],
      secondNumber: RandomNumber[1],
    });
    let keys = this.web3.eth.accounts.create(mnemonic);
        console.log(keys);
        this.setState({
        ethAddr: keys.address,
        ethPrivKey: keys.privateKey});
        this.props.dispatchKeys(keys.address, keys.privateKey);
  }

  _takeMeBack() {
    this.setState({
      step: 1
    })
  }

  _nextStep() {
    this.setState({
      step: this.state.step + 1
    })
  }


  state = {
    activeStep: 0,
    firstNumber: Number,
    secondNumber: Number,
    magicWords: "",
    firstRandomWord: "",
    secondRandomWord: "",
    confirmFirstRandomWord: "",
    confirmSecondRandomWord: "",
    password:''
  };

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };
  handleSave = () => {
    const schema = {
      ethAddr: {
        type: 'string',
      },
      ethPrivKey: {
        type: 'string',
      }
    };
    const store = new Store({schema});
    store.set('ethAddr', this.state.ethAddr);
    store.set('ethPrivKey', this.state.ethPrivKey);
    console.log(store.get('ethAddr'));
    console.log(store.get('ethPrivKey'));
    var fs = require('fs');
    let fileName = './clients/go-ethereum/node1/keystore/main_account.json';
    fs.writeFile(fileName, JSON.stringify(this.web3.eth.accounts.encrypt(this.state.ethPrivKey, this.state.password)), (err) => {
      if(err){
        alert("An error ocurred creating the file "+ err.message)
      }
      alert("The file has been succesfully saved");
    });
    update_eth_account(this.props.user.token, this.props.user.userName, this.state.ethAddr)
      .then(res => {
        if (res.status === 200) {
          this.props.history.push('/profile');

        } else {
          this.props.history.push('/main');
        }
      });

  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    console.log(name, event.target.value)
  };

  render() {
    // const magicWordsArray = this.state.magicWords.split(" ");

    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div className={classes.root}>
        <Paper className={classes.root} elevation={1}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <div>
                <Typography component={'span'} variant="body2" gutterBottom color='textPrimary'>
                  {getStepContent(index, this.state.magicWords, this.state.ethAddr)}
                </Typography>
                </div>
                  <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>Please specify a password for your account</Typography>
            <TextField
              id="input-account"
              label="Password"
              className="input-account"
              onChange={this.handleChange('password')}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              style={{width: 300}}
            />
            <Button onClick={this.handleSave} className={classes.button}>
              Save
            </Button>
            <Button onClick={this.handleReset} className={classes.button}>
              Reset
            </Button>
          </Paper>
        )}
        </Paper>
      </div>
    )
  }
}

Mnemonic.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles)(Mnemonic);



