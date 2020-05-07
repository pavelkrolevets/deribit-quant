import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
const Store = require('electron-store');
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
    get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({data: result.data});
        this.forceUpdate();
      });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  async updateUserKeys(){
    await update_api_keys(this.props.user.token, this.props.email, this.state.api_pubkey, this.state.api_privkey)
      .then(result=> {console.log(result);
      });
    get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({data: result.data});
        this.forceUpdate();
      });
  }


  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>

        <h1 className={classes.title}>Profile</h1>
        <Typography variant="body1" gutterBottom color='#FFF'>
          {this.props.email} </Typography>
        <h4 className={classes.mainText}>Api keys</h4>


          <div className={classes.inputGroup}>
          <Typography variant="body1" gutterBottom color='#FFF'>
            Pub: {this.state.data.api_pubkey} </Typography>
          <Typography variant="body1" gutterBottom color='#FFF'>
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
            variant="filled"
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

