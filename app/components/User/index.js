import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { get_tasks, update_eth_account, upload_file } from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';
import axios from 'axios';
import FormData from 'form-data'
import { get_api_keys, update_api_keys} from '../../utils/http_functions';
import { start_saga_ws, stop_saga_ws } from '../../redux/actions/saga_ws';
import { storeDeribitAccount } from '../../redux/actions/auth';
import { connect } from "react-redux";

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


const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'flex-start',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    width: window.innerWidth,
    height: window.innerHeight,
  },
  table: {
    minWidth: 700,
  },

  bigAvatar: {
    margin: 10,
    width: 100,
    height: 100,
  },

  title: {
    color:'#dc6b02'
  },
  mainText:{
    color:'#dc6b02',
    marginBottom: 10
  },
  button:{
    color:'#FFF',
    backgroundColor: 'red',
    margin: 20,
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
  inputGroup:{
    display: 'flex',
    // justifyContent:'center',
    alignItems:'flex-start',
    flexDirection: 'column'
  },
});




function mapStateToProps(state) {
  return {
    email: state.auth.userName,
    user: state.auth,
    isAuthenticated: state.auth.isAuthenticated,
    sagas_channel_run: state.sagas.sagas_channel_run,
  };
}

const mapDispatchToProps = dispatch => ({
  start_saga_ws: () => dispatch(start_saga_ws()),
  stop_saga_ws: () => dispatch(stop_saga_ws()),
  storeDeribitAccount: (pub_key, priv_key)=> dispatch(storeDeribitAccount(pub_key, priv_key))
});

@connect(
  mapStateToProps,
  mapDispatchToProps)
class Profile extends Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
  }

  state = {
    api_pubkey:'',
    api_privkey:'',
    data:''
  };

  async componentWillMount() {
    try{
      get_api_keys(this.props.user.token, this.props.email)
        .then(response=> {
          console.log('Deribit Api Keys', response);
          if (response.status === 200) {
            if(response.data.api_pubkey!==null&&response.data.api_privkey!==null){
              // this.props.storeDeribitAccount(response.data.api_pubkey, response.data.api_privkey);
              // store.set('api_pubkey', response.data.api_pubkey);
              // store.set('api_privkey', response.data.api_privkey);
              // if (this.props.sagas_channel_run){
              //   this.props.stop_saga_ws();
              // } else if (!this.props.sagas_channel_run){
              //   this.props.start_saga_ws();
              // }
              this.setState({data: response.data});
              this.forceUpdate();
            } else if (response.data.api_pubkey === null || response.data.api_privkey === null){
              alert("Keys are empty on the server, please enter");
              this.props.stop_saga_ws();
            }
          }
        });
    }
    catch (e) {
      alert(e)
    }

  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  async updateUserKeys(){
    try{ await update_api_keys(this.props.user.token, this.props.email, this.state.api_pubkey, this.state.api_privkey)
      .then(response=> {
        console.log(response);
        if (response.status === 200) {
          alert("Keys successfully updated on the server");
          this.props.storeDeribitAccount(response.data.api_pubkey, response.data.api_privkey);
          store.set('api_pubkey', response.data.api_pubkey);
          store.set('api_privkey', response.data.api_privkey);
          if (this.props.sagas_channel_run){
            this.props.stop_saga_ws();
          } else if (!this.props.sagas_channel_run){
            this.props.start_saga_ws();
          }
          this.setState({data: response.data});
          this.forceUpdate();
        }

      })}
      catch (e) {
        alert("Keys already exist under another account, please provide another");
        this.props.stop_saga_ws();
        console.log(e);
      }

    // await get_api_keys(this.props.user.token, this.props.email)
    //   .then(response=> {console.log(response);
    //     console.log('Deribit Api Keys', response);
    //     if (response.status === 200) {
    //       if(response.data.api_pubkey!==null&&response.data.api_privkey!==null){
    //         dispatch(storeDeribitAccount(response.data.api_pubkey, response.data.api_privkey));
    //         store.set('api_pubkey', response.data.api_pubkey);
    //         store.set('api_privkey', response.data.api_privkey);
    //         if (this.props.sagas_channel_run){
    //           this.props.stop_saga_ws();
    //         } else if (!this.props.sagas_channel_run){
    //           this.props.start_saga_ws();
    //         }
    //         this.setState({data: response.data});
    //         this.forceUpdate();
    //       } else if (response.data.api_pubkey === null || response.data.api_privkey === null){
    //         alert("Please provide Deribit keys API to continue ");
    //         this.props.stop_saga_ws();
    //       }
    //     } else if (response.status === 500) {
    //       alert("Keys already exist under another account, please provide another");
    //       this.props.stop_saga_ws();
    //     }
    //
    //
    //   });
  }




  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>

        <h1 className={classes.title}>Profile</h1>
        <Typography variant="body1" gutterBottom>
          {this.props.email} </Typography>
        <h4 className={classes.mainText}>Api keys</h4>


          <div className={classes.inputGroup}>
          <Typography variant="body1" gutterBottom>
            Pub: {this.state.data.api_pubkey} </Typography>
          <Typography variant="body1" gutterBottom>
            Secret: {this.state.data.api_privkey}</Typography>
          </div>

        <div >
          <TextField
            id="input-api_pub_key"
            label="Api key"
            className="input-key"
            onChange={this.handleChange('api_pubkey')}
            margin="normal"
            variant="filled"
            fullWidth
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
          />
          <TextField
            id="input-api_priv_key"
            label="Api seceret"
            className="input-key"
            onChange={this.handleChange('api_privkey')}
            margin="normal"
            variant="filled"
            fullWidth
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
          />
          <Button
            className={classes.button}
            onClick={()=>this.updateUserKeys()}
            variant="contained"
            // color="primary"
          >Update</Button>
        </div>
        {/*<div>*/}
        {/*  <h4 className={classes.mainText}>NOTE: Due to security concerns, API keys are stored only locally. </h4>*/}
        {/*</div>*/}


      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);

