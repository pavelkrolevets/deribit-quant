import React from 'react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import Profile from './containers/Profile'
import DeribitOptionPos from './containers/DeribitOptionPos'
import DeribitDeltaHedger from './containers/DeribitDeltaHedger'
import Analize from './containers/Analize'
import Simulate from './containers/Simulate'
import Vola from './containers/Vola'
import LoginView from './components/Login'
import RegisterView from './components/Register'
import Main from './components/Main';
import Stat from './containers/Statistics'
import { requireAuthentication } from './components/Auth/AuthenticatedComponent';
import { requireNoAuthentication } from './components/Auth/notAuthenticatedComponent';



export default () => (
  <App>
    <Switch>
      <Route path="/login" component={requireNoAuthentication(LoginView)} />
      <Route path="/register" component={requireNoAuthentication(RegisterView)} />
      <Route path="/stat" component={requireAuthentication(Stat)} />
      <Route path="/deltahedger" component={requireAuthentication(DeribitDeltaHedger)} />
      <Route path="/options" component={requireAuthentication(DeribitOptionPos)} />
      <Route path="/vola" component={requireAuthentication(Vola)} />
      <Route path="/profile" component={requireAuthentication(Profile)} />
      <Route path="/simulate" component={requireAuthentication(Simulate)} />
      <Route path="/analyze" component={requireAuthentication(Analize)} />
      <Route path="/" component={requireNoAuthentication(Main)} />
    </Switch>
  </App>
);
