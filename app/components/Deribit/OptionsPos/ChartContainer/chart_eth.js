// @flow
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles/index';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';
import Typography from '@material-ui/core/Typography';

import {
  XYPlot,
  XAxis,
  YAxis,
  ChartLabel,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  LineSeriesCanvas,
  Crosshair
} from 'react-vis';
import { connect } from "react-redux";
import { start_saga_ws, stop_saga_ws } from '../../../../redux/actions/saga_ws';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  root: {
    width: '100%'
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  chart: {},
  appBar: {
    background: '#920017',
    borderRadius: 3,
    border: 0,
    padding: '0 30px',
    height: '10%'
  }
});

// function mapStateToProps(state) {
//   return {
//     isAuthenticating: state.auth.isAuthenticating,
//     email: state.auth.userName,
//     user: state.auth,
//     deribit_BTC_index: state.sagas.deribit_BTC_index,
//   };
// }
//
// const mapDispatchToProps = dispatch => ({
//   start_saga_ws: () => dispatch(start_saga_ws()),
//   stop_saga_ws: () => dispatch(stop_saga_ws())
// });
//
// @connect(
//   mapStateToProps,
//   mapDispatchToProps)
class Chart_eth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: true,
      chart_data_current: this.props.chart.chart_data_current,
      account: [{ equity: 0, delta_total: 0 }],
    };
  }

  componentWillMount() {
    this.setState({
      chart_data_current: this.props.chart.chart_data_current
    });
  }

  // componentWillReceiveProps(nextProps: Props, nextContext: *){
  //   console.log("Got props account",  this.props.chart.account);
  // }

  _onMouseLeave = () => {
    this.setState({ crosshairValues: [] });
  };

  _onNearestX = (value, { index }) => {
    this.setState({ crosshairValues: [this.props.chart.chart_data_current[index]] });
  };

  render() {
    let yDomain = this.props.chart.yDomain;
    const { classes } = this.props;

    return (
      <TabContainer>
        {/*<h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions </h4>*/}
        <div>
          <Table className={classes.table} size="small">
            <TableHead>
              {/*<TableRow style={{backgroundColor:'red', color: 'white'}}>*/}
              <TableRow>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Equity
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Global delta
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Index
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.chart.account.map((row, i) => (
                <TableRow key={i}>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.equity).toFixed(2)}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.delta_total).toFixed(2)}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {this.props.chart.index}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {this.props.chart.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <h6 style={{ color: '#FFF' }}>Range</h6>
          <div
            style={{
              display: 'flex',
              justifyContent: 'left',
              alignItems: 'left'
            }}
          >
            <IconButton onClick={() =>this.props.zoomIn()}>
              <ZoomIn color="secondary" />
            </IconButton>
            <IconButton onClick={() => this.props.zoomOut()}>
              <ZoomOut color="secondary" />
            </IconButton>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/*Main graph*/}
          <XYPlot
            height={480}
            width={window.innerWidth * 0.7}
            margin={{left: 100}}
            onMouseLeave={this._onMouseLeave}
            {...{ yDomain }}
          >
            {/*<HorizontalGridLines />*/}
            {/*<VerticalGridLines />*/}
            <XAxis on0={true} />
            <YAxis on0={true} />
            <ChartLabel
              text="Price"
              className="alt-x-label"
              includeMargin={false}
              xPercent={0.025}
              yPercent={1.01}
            />

            <ChartLabel
              text="Profit"
              className="alt-y-label"
              includeMargin={false}
              xPercent={0.06}
              yPercent={0.06}
              style={{
                transform: 'rotate(-90)',
                textAnchor: 'end'
              }}
            />
            <LineSeries
              className="first-series"
              onNearestX={this._onNearestX}
              data={this.props.chart.chart_data_current}
            />
            <LineSeries data={this.props.chart.chart_data_at_zero} />
            <Crosshair
              values={this.state.crosshairValues}
              className={'test-class-name'}
            />
            {/*<Crosshair*/}
            {/*values={[{x: parseInt(this.state.index), y:0}]}*/}
            {/*className={'market-class-name'}*/}
            {/*/>*/}
          </XYPlot>
        </div>
        <br />
        {/* Positions*/}
        <div>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Instrument
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Amount
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Direction
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Delta
                </TableCell>
                <TableCell align="center" style={{ color: '#FFF' }}>
                  Average price
                </TableCell>
                {/*<TableCell align="center">Average price USD</TableCell>*/}
                <TableCell align="center" style={{ color: '#FFF' }}>
                  PnL
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.chart.client_positions.map((row, i) => (
                <TableRow
                  key={i}
                  // onClick={event => this.handleClick(event, row.pid)}
                  selected
                  hover
                >
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.instrument_name}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.size).toFixed(2)}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {row.direction}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.delta).toFixed(2)}
                  </TableCell>
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.average_price).toFixed(2)}
                  </TableCell>
                  {/*<TableCell align="center">*/}
                  {/*  {parseFloat(row.averageUsdPrice).toFixed(2)}*/}
                  {/*</TableCell>*/}
                  <TableCell align="center" style={{ color: '#dc6b02' }}>
                    {parseFloat(row.total_profit_loss).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabContainer>
    );
  }
}
Chart_eth.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Chart_eth);
