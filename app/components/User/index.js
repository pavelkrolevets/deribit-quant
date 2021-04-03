import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import { get_tasks, update_eth_account, upload_file } from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';
import axios from 'axios';
import FormData from 'form-data'
import { get_api_keys, update_api_keys, verify_api_keys} from '../../utils/http_functions';
import { connect } from "react-redux";
import { keys } from '@material-ui/core/styles/createBreakpoints';

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
});


class Profile extends Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
  }

  state = {
    api_pubkey:'',
    api_privkey:'',
    data:'',
    showModal: false,
    api_keys_password: '',
    message:''
  };
  
  getFromStore(value){
    if(store.get(value)){
      let item = store.get(value);
      return Promise.resolve(item)
    } else {
      return Promise.reject(new Error('No value found'))
    }
  }

  async componentWillMount() {
    try {
      let keys = {}
      keys.api_pubkey = await this.getFromStore('api_pubkey');
      keys.api_privkey = await this.getFromStore('api_privkey');
      await verify_api_keys(this.props.user.token, keys.api_pubkey, keys.api_privkey);
      this.setState({data: keys})
      this.forceUpdate();
      if (!this.props.sagas_channel_run){
        this.props.start_saga_ws();
      }
    }
    catch (e) {
      this.setState({showUpdateModal: true});
    }

  }

  logout(e) {
    e.preventDefault();
    this.props.logoutAndRedirect(this.props.history);
    this.setState({
      open: false
    });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  // getUserKeys(){
  //   console.log("Getting api keys")
  //   get_api_keys(this.props.user.token, this.props.email, this.state.api_keys_password)
  //   .then(response=> {
  //     console.log('Deribit Api Keys', response);
  //       this.props.storeDeribitAccount(response.data.api_pubkey, response.data.api_privkey);
  //       store.set('api_pubkey', response.data.api_pubkey);
  //       store.set('api_privkey', response.data.api_privkey);
  //       if (!this.props.sagas_channel_run){
  //         this.props.start_saga_ws();
  //       }
  //       this.setState({data: response.data});
  //       return (setTimeout(()=>{
  //         this.forceUpdate();
  //         return this.setState({showGetModal: false});
  //       }, 1000));
  //   })
  //   .catch((e)=> {
  //     console.log("error", e.response.status)
  //     switch (e.response.status) {
  //       case 403:
  //         this.setState({message: e.response.status + " " + e.response.data.message});
  //         setTimeout(()=>{
  //             this.setState({message: null});
  //           }, 2000);
  //         break;
  //       case 409:
  //         this.setState({message: e.response.status + " " + e.response.data.message});
  //         return (setTimeout(()=>{
  //           this.setState({showGetModal: false});
  //           this.setState({showUpdateModal: true})
  //           this.props.stop_saga_ws();
  //           this.setState({message: null});
  //         }, 2000));
  //       case 500:
  //         this.setState({message: e.response.status + " " + e.response.data.message});
  //         return (setTimeout(()=>{
  //           this.setState({showGetModal: false});
  //           this.setState({showUpdateModal: true})
  //           this.props.stop_saga_ws();
  //           this.setState({message: null});
  //         }, 2000));
  //     }
  //   })
  // }

  updateUserKeys(){
    // try { 
      console.log("Outcoming API keys", this.state.api_pubkey, this.state.api_privkey);
      update_api_keys(this.props.user.token, this.props.email, this.state.api_pubkey, this.state.api_privkey, this.state.api_keys_password)
      .then(parseJSON)
      .then(response=> {
        console.log("Update response", response);
        
        this.props.storeDeribitAccount(response.api_pubkey, response.api_privkey);
        store.set('api_pubkey', response.api_pubkey);
        store.set('api_privkey', response.api_privkey);
        if (!this.props.sagas_channel_run){
          this.props.start_saga_ws();
        }
        this.setState({data: response});
        this.setState({message: "Keys successfully updated on the server"});
        setTimeout(()=>{
          return this.setState({showUpdateModal: false});
        }, 1000);
      })
      .catch((e)=> {
        console.log("Error", e)
        this.setState({message: e.response.status + " " + e.response.data.message});
        return (setTimeout(()=>{
          this.setState({message: null});
          this.props.stop_saga_ws();
        }, 3000));
      })
    // } catch (e) {
    //     alert(e.message);
    //     this.props.stop_saga_ws();
    //     console.log(e);
    //   }

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


  verifyUserKeys(){
    verify_api_keys(this.props.user.token, this.props.email, this.state.api_pubkey, this.state.api_privkey)
    .then((response)=>{
      return Promise.resolve(response.data.keys_valid)
    })
    .catch((e)=> {
      this.setState({message: e.response.status + " " + e.response.data.message});
      this.setState({showUpdateModal: true})
      return (setTimeout(()=>{
        this.setState({message: null});
        this.props.stop_saga_ws();
      }, 1000));
    })
  }

  render() {
    const { classes } = this.props;
    // const [showModal, setOpen] = React.useState(false);
    const modalUpdateBody = (
      <div className={classes.modal_paper}>
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
          >Ok</Button>
           <Button
            className={classes.button}
            onClick={e => this.logout(e)}
            variant="contained"
            // color="primary"
          >Calcel</Button>
          <h4 id="simple-modal-title">{this.state.message}</h4>
          </div>
    );

    const modalGetBody = (
      <div className={classes.modal_paper}>
        <h4 id="simple-modal-title">Load keys</h4>
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
            onClick={() => this.getUserKeys()}
            variant="contained"
            // color="primary"
          >Ok</Button>
           <Button
            className={classes.button}
            onClick={()=>this.setState({showGetModal: false})}
            variant="contained"
            // color="primary"
          >Calcel</Button>
          <h4 id="simple-modal-title">{this.state.message}</h4>
          </div>
    );


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
          <Button
            className={classes.button}
            onClick={()=>this.setState({showUpdateModal: true})}
            variant="contained"
            // color="primary"
          >Update</Button>
        </div>
        {/*<div>*/}
        {/*  <h4 className={classes.mainText}>NOTE: Due to security concerns, API keys are stored only locally. </h4>*/}
        {/*</div>*/}
        <Modal
        className={classes.modal}
        open={this.state.showUpdateModal}
        // onClose={()=>this.updateUserKeys()}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {modalUpdateBody}
      </Modal>
      
      <Modal
        className={classes.modal}
        open={this.state.showGetModal}
        // onClose={()=>this.updateUserKeys()}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {modalGetBody}
      </Modal>

      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
  deribit_auth: PropTypes.bool,
  logoutAndRedirect: PropTypes.func,
};

export default withStyles(styles)(Profile);

