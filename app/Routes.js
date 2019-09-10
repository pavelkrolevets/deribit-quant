import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Wallet from './containers/Wallet'
import GenMnem from './containers/Mnemonic'
import Profile from './containers/Profile'
import Deribit from './containers/Deribit'
import LoginView from './components/Login'
import RegisterView from './components/Register'
import ProtectedView from './components/Main';
import { requireAuthentication } from './components/Auth/AuthenticatedComponent';
import { requireNoAuthentication } from './components/Auth/notAuthenticatedComponent';



export default () => (
  <App>
    <Switch>
      <Route path="/login" component={requireNoAuthentication(LoginView)} />
      <Route path="/register" component={requireNoAuthentication(RegisterView)} />
      <Route path="/options" component={requireAuthentication(Deribit)} />
      <Route path="/profile" component={requireAuthentication(Profile)} />
      <Route path="/wallet" component={requireAuthentication(Wallet)} />
      <Route path="/mnemonic" component={requireAuthentication(GenMnem)} />
      <Route path="/main" component={requireAuthentication(ProtectedView)} />
      <Route path="/" component={requireNoAuthentication(HomePage)} />
    </Switch>
  </App>
);
