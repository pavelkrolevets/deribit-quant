import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions/data';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';

function mapStateToProps(state) {
  return {
    data: state.data,
    token: state.auth.token,
    loaded: state.data.loaded,
    isFetching: state.data.isFetching,
  };
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ProtectedView extends React.Component {
  componentDidMount() {
    this.fetchData();
    console.log(this.props.loaded);
    console.log(this.props.userName);
    console.log(this.props.data)
  }

  fetchData() {
    const token = this.props.token;
    this.props.fetchProtectedData(token);
  }

  render() {
    return (
      <div>
        {!this.props.loaded
          ? <h1>Loading data...</h1>
          :
          <Paper>
            <h1>Welcome back,
              {this.props.userName}!</h1>
          </Paper>
        }
      </div>
    );
  }
}

ProtectedView.propTypes = {
  fetchProtectedData: PropTypes.func,
  loaded: PropTypes.bool,
  userName: PropTypes.string,
  data: PropTypes.any,
  token: PropTypes.string,
};
