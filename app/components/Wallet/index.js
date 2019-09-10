import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withRouter } from 'react-router-dom';

const styles = {
  card: {
    maxWidth: 400,
    minWidth: 300,
    marginTop:20,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  mainContainer:{
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
};



class Wallet extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
  const { classes } = this.props;
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <div style={styles.mainContainer}>
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2">
          Keystore File <br/>
        </Typography>
        <Typography component="p">
          {bull} An encrypted JSON file, protected by a password <br/>
          {bull} Back it up on a USB drive <br/>
          {bull} Cannot be written, printed, or easily transferred to mobile <br/>
          {bull} Compatible with Mist, Parity, Geth <br/>
          {bull} Provides a single address for sending and receiving <br/>
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="outlined" color="primary" className={classes.button}>Generate a Keystore File</Button>
      </CardActions>
    </Card>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h5" component="h2">
            Mnemonic Phrase
          </Typography>
          <Typography component="p">
            {bull} A 12-word private seed phrase <br/>
            {bull} Back it up on paper or USB drive <br/>
            {bull} Can be written, printed, and easily typed on mobile, too <br/>
            {bull} Compatible with MetaMask, Jaxx, imToken, and more <br/>
            {bull} Provides unlimited addresses for sending and receiving <br/>
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="outlined" color="primary" className={classes.button} onClick={() => this.props.history.push('/mnemonic')}>Generate a Mnemonic Phrase</Button>
        </CardActions>
      </Card>
    </div>
  );
}
}

Wallet.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Wallet));
