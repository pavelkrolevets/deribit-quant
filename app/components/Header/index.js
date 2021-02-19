// @flow
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import { red, green } from '@material-ui/core/colors';

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
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,

    backgroundColor: '#FF9A00',
    // backgroundColor: fade(theme.palette.common.white, 0.15),
    // '&:hover': {
    //   backgroundColor: fade(theme.palette.common.white, 0.25),
    // },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto'
    }
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black'
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  formControl: {
    width: '100%',
    backgroundColor: '#000'
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200
    },
    color: 'black'
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },

  gradientAppBar: {
    background: 'linear-gradient(45deg, #4A4A4A 30%, #7C7C7C 90%)',
    borderRadius: 3,
    border: 0,
    padding: '0 30px'
  }
});

const ColorSwitch = withStyles({
  switchBase: {
    color: green[500],
    '&$checked': {
      color: '#dc6b02'
    },
    '&$checked + $track': {
      backgroundColor: '#000'
    }
  },
  checked: {},
  track: {}
})(Switch);

class Header extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // this.props.initializeSocket();
  }

  componentDidMount() {
    // setInterval(()=>{
    //   if (!this.props.deribit_auth){
    //     this.props.history.push("/profile");
    //   }
    // }, 5000)
    // console.log(this.props.socket.connected);
  }

  state = {
    anchorEl: null,
    mobileMoreAnchorEl: null,
    DrowerOpen: false
  };

  dispatchNewRoute(route) {
    this.props.history.push(route);
    this.setState({
      DrowerOpen: false
    });
  }

  handleDrawerOpen() {
    this.setState({
      DrowerOpen: true
    });
  }

  handleDrawerClose = () => {
    this.setState({ DrowerOpen: false });
  };

  handleProfileMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = value => event => {
    this.setState({ anchorEl: null });
    this.setState({ DrowerOpen: false });
    this.handleMobileMenuClose();
    this.props.history.push(value);
  };

  handleMenuClickClose(){
    this.setState({ anchorEl: null });
  }

  handleMobileMenuOpen = event => {
    this.setState({ mobileMoreAnchorEl: event.currentTarget });
  };

  handleMobileMenuClose = () => {
    this.setState({ mobileMoreAnchorEl: null });
  };

  logout(e) {
    e.preventDefault();
    this.props.logoutAndRedirect(this.props.history);
    this.setState({
      open: false
    });
  }
  handleDeribitNetChange = event => {
    // console.log('Checked event', event.target.checked);
    if (event.target.checked === false) {
      this.props.set_deribit_realnet();
    } else if (event.target.checked === true) {
      this.props.set_deribit_testnet();
    }
  };

  render() {
    const { anchorEl, mobileMoreAnchorEl } = this.state;
    const { classes, theme } = this.props;
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose()}
      >
        {!this.props.isAuthenticated ? (
          <div>
            <MenuItem onClick={this.handleMenuClose('/login')}>Login</MenuItem>
            <MenuItem onClick={this.handleMenuClose('/register')}>
              Register
            </MenuItem>
          </div>
        ) : (
          <div>
            <MenuItem onClick={this.handleMenuClose('/profile')}>
              Profile
            </MenuItem>
            <MenuItem onClick={e => this.logout(e)}>Logout</MenuItem>
          </div>
        )}
      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMenuClose()}
      >
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <MailIcon />
            </Badge>
          </IconButton>
          <p>Messages</p>
        </MenuItem>
        <MenuItem onClick={this.handleMobileMenuClose}>
          <IconButton color="inherit">
            <Badge badgeContent={11} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <p>Notifications</p>
        </MenuItem>
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

    return (
      <div className={classes.root}>
        {/*<FormGroup>*/}
        {/*  <FormControlLabel*/}
        {/*    control={<ColorSwitch checked={this.props.deribit_testnet} onChange={this.handleDeribitNetChange} aria-label="testnet switch" />}*/}
        {/*    label={this.props.deribit_testnet ? 'Testnet' : 'Realnet'}*/}
        {/*  />*/}
        {/*</FormGroup>*/}

        <Drawer
          open={this.state.DrowerOpen}
          onClose={this.handleMenuClose()}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'ltr' ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </div>
          {!this.props.isAuthenticated ? (

          
                <div>
                <MenuItem onClick={this.handleMenuClose('/login')}>
                  Login
                </MenuItem>
                <MenuItem onClick={this.handleMenuClose('/register')}>
                  Register
                </MenuItem>
                <MenuItem onClick={this.handleMenuClose('/vola')}>
                  Vola
                </MenuItem>
              </div>
              
            

           
          ) : ( 

            
              !this.props.deribit_auth ? (
                <div>
                <MenuItem onClick={this.handleMenuClose('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem onClick={this.handleMenuClose('/vola')}>
                  Vola
                </MenuItem>
              </div>
              
              ) : (

            <div>
              <div>
                <MenuItem onClick={this.handleMenuClose('/robo')}>Chart</MenuItem>
              </div>
              <MenuItem onClick={this.handleMenuClose('/deltahedger')}>
                DeltaHedger
              </MenuItem>
              <MenuItem onClick={this.handleMenuClose('/options')}>
                Position
              </MenuItem>
              <MenuItem onClick={this.handleMenuClose('/vola')}>
                Vola
              </MenuItem>
            </div>
            )
          )}
        </Drawer>
        <AppBar position="static" className={classes.gradientAppBar}>
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Open drawer"
              onClick={() => this.handleDrawerOpen()}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              className={classes.title}
              variant="h6"
              color="inherit"
              noWrap
            >
              Periscope
            </Typography>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              {/*<IconButton color="inherit">*/}
              {/*<Badge badgeContent={4} color="secondary">*/}
              {/*<MailIcon />*/}
              {/*</Badge>*/}
              {/*</IconButton>*/}
              {/*<IconButton color="inherit">*/}
              {/*<Badge badgeContent={17} color="secondary">*/}
              {/*<NotificationsIcon />*/}
              {/*</Badge>*/}
              {/*</IconButton>*/}
              <IconButton
                aria-owns={isMenuOpen ? 'material-appbar' : undefined}
                aria-haspopup="true"
                onClick={this.handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton
                aria-haspopup="true"
                onClick={this.handleMobileMenuOpen}
                color="inherit"
              >
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderMobileMenu}
      </div>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  logoutAndRedirect: PropTypes.func,
  isAuthenticated: PropTypes.bool,
  deribit_testnet: PropTypes.bool,
  set_deribit_testnet: PropTypes.func,
  set_deribit_realnet: PropTypes.func,
  deribit_auth: PropTypes.bool
};

export default withRouter(withStyles(styles, { withTheme: true })(Header));
