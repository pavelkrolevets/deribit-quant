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
import { compute_bsm, get_api_keys } from '../../../utils/http_functions';



const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  chart:{

  }
});


class DeribitOptionPos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option_values: [],
      chart_data_current: [],
      chart_data_at_zero: [],
      trade_price: 10,
      crosshairValues: [],
      yDomain: [-20, 20],
      keys: {},
      positions: [],
      index: 0,
      account: [],
      time: Date.now()
    };

  }


  async componentWillMount(){
    await get_api_keys(this.props.user.token, this.props.email)
      .then(result=> {console.log(result);
        this.setState({keys: result.data});
        this.forceUpdate();
      });

    let RestClient = await require("deribit-api").RestClient;
    this.restClient = await new RestClient(this.state.keys.api_pubkey, this.state.keys.api_privkey, "https://test.deribit.com");

    await this.restClient.positions((result) => {
      console.log("Positions: ", result.result);
      this.setState({positions: result.result});
    });

    await this.restClient.index((result) => {
      console.log("Index: ", result);
      this.setState({index: result.result.btc})
    });

    await this.restClient.account((result) => {
      console.log("Account: ", result.result);
      this.setState({account: [result.result]});
    });

    await this.plot();


    // this.web3 = new Web3(new Web3.providers.WebsocketProvider('ws://104.129.16.66:8546'));
    // this.web3.eth.getBlock('latest').then(console.log).catch(console.log);
    // this.web3.eth.getAccounts(function (error, res) {
    //   if (!error) {
    //     console.log(res);
    //   } else {
    //     console.log(error);
    //   }
    // });
    clearInterval(this.interval);
  }

  componentDidMount() {
    this.interval = setInterval(() => console.log(Date.now()), 1000);
  }

  async plot(){
    await this.computeBSM(10, 0.3)
      .then(result=>this.setState({chart_data_current: result}));
    await this.computeBSM(10, 0.00001)
      .then(result=>this.setState({chart_data_at_zero: result}));
  }

  async computeBSM (trade_price, T) {
    let data = [];
    let S0 = [];
    let chart_data=[];

    for (let i=0; i < 200; i += 10){
      data.push(JSON.stringify({S0: i, K:120, T:T, r: 0.03, sigma: 0.7}));
      S0.push(i)
    }
    console.log(data);
    await compute_bsm(this.props.user.token, 'call', data)
      .then(response=> {console.log(response);
      this.setState({option_values: response.data.option_values });
      });

    let y_range = [];
    for (let i=0; i<S0.length; i++) {
      chart_data.push({x: S0[i], y: (this.state.option_values[i]-trade_price)});
      y_range.push((this.state.option_values[i]-trade_price))
    }
    this.setState({yDomain: [Math.min(...y_range)-20, Math.max(...y_range)+20]});

    return chart_data;
  }

  _onMouseLeave = () => {
    this.setState({crosshairValues: []});
  };

  _onNearestX = (value, {index}) => {
    this.setState({crosshairValues: [this.state.chart_data_current[index]]});
  };

  async get_open_positions(){



    function calculate(item, index, arr) {
      console.log(item);
      console.log(index);
    }

    this.state.positions.forEach(calculate)

  }


  render() {
    const {classes} = this.props;
    const {useCanvas} = this.state;
    const content = useCanvas ? 'TOGGLE TO SVG' : 'TOGGLE TO CANVAS';
    const Line = useCanvas ? LineSeriesCanvas : LineSeries;
    let {yDomain} = this.state;
    return (
      <div data-tid="container" style={{display: 'flex',  justifyContent:'center', alignItems:'center', flexDirection:"column"}}>
        <h4 style={{color:"#152880", display: 'flex',  justifyContent:'center', alignItems:'center'}}>Option positions</h4>
        <div>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Equity</TableCell>
                <TableCell align="center">Global delta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.account.map((row, i) => (
                <TableRow key={i}
                >
                  <TableCell align="center">
                    {row.equity}
                  </TableCell>
                  <TableCell align="center">
                    {row.deltaTotal}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

          <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
            {/*Main graph*/}
          <XYPlot width={700} height={500} onMouseLeave={this._onMouseLeave} {...{yDomain}}>
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis on0={true}/>
            <YAxis on0={true}/>
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
              data={this.state.chart_data_current}
            />
            <LineSeries data={this.state.chart_data_at_zero} />
            <Crosshair
              values={this.state.crosshairValues}
              className={'test-class-name'}
            />
          </XYPlot>
          </div>
        <div>
          {/*Table with parameters*/}
          <Paper>
            <div>
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Instrument</TableCell>
                    <TableCell align="center">Amount</TableCell>
                    <TableCell align="center">Direction</TableCell>
                    <TableCell align="center">Delta</TableCell>
                    <TableCell align="center">Average price</TableCell>
                    <TableCell align="center">Average price USD</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.positions.map((row, i) => (
                    <TableRow key={i}
                      // onClick={event => this.handleClick(event, row.pid)}
                              selected
                              hover
                    >
                      <TableCell align="center">
                        {row.instrument}
                      </TableCell>
                      <TableCell align="center">
                        {row.amount}
                      </TableCell>
                      <TableCell align="center">
                        {row.direction}
                      </TableCell>
                      <TableCell align="center">
                        {row.delta}
                      </TableCell>
                      <TableCell align="center">
                        {row.averagePrice}
                      </TableCell>
                      <TableCell align="center">
                        {row.averageUsdPrice}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Paper>
        </div>

        <Button
          className={classes.button}
          onClick={()=>this.get_open_positions()}
          variant="outlined"
          // color="primary"
        >Compute</Button>

      </div>
    );
  }
}


DeribitOptionPos.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DeribitOptionPos);
