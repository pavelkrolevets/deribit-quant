import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import * as actionCreators from '../actions/data';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import { get_api_keys } from '../../utils/http_functions';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    flexDirection: 'column',
    backgroundColor: 'black',
    // width: window.innerWidth,
    height: window.innerHeight,
  },

  title: {
    color:'#FFF'
  },
  mainText:{
    color:'#d3d3d3',
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

@connect(mapStateToProps, mapDispatchToProps)
class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    api_pubkey: '',
    api_privkey: '',
    data: '',
    showModal: false,
    api_keys_password: '',
    message: ''
  };

  getFromStore(value) {
    if (store.get(value)) {
      let item = store.get(value);
      return Promise.resolve(item);
    } else {
      return Promise.reject(new Error('No value found'));
    }
  }

  async componentWillMount() {
    try {
      let keys = {};
      keys.api_pubkey = await this.getFromStore('api_pubkey');
      keys.api_privkey = await this.getFromStore('api_privkey');
      this.setState({ data: keys });
      this.forceUpdate();
    } catch (e) {
      this.setState({ showGetModal: true });
    }
  }

  render() {
    const { classes } = this.props;

    const modalGetBody = (
      <div className={classes.modal_paper}>
        <h4 id="simple-modal-title">
          There is no API keys are present. Please update at "Profile"
        </h4>
        <Button
          className={classes.button}
          onClick={() => {
            this.setState({ showGetModal: false });
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
        <div>
          <h1>Welcome {this.props.userName}!</h1>
          <br />
          <br />
          <h4 className={classes.mainText}>
            Please provide testnet Deribit API keys on Profile page.
          </h4>
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
      </div>
    );
  }
}

Main.propTypes = {
  fetchProtectedData: PropTypes.func,
  loaded: PropTypes.bool,
  userName: PropTypes.string,
  data: PropTypes.any,
  token: PropTypes.string,
  storeDeribitAccount: PropTypes.func,
  email: PropTypes.string,
  user: PropTypes.string,

};

export default withStyles(styles)(Main);
