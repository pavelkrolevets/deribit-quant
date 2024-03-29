/* eslint camelcase: 0 */

import axios from 'axios';

// let backend = 'http://localhost:5002';
// let backend = 'http://209.250.239.91:5000';
let backend = 'http://0xbtc.ru:5002';
// let backend = 'http://134.0.104.2:5002';


export function validate_token(token) {
  return axios.post(backend + '/api/is_token_valid', {
    token
  });
}

export function get_github_access() {
  window.open(
    '/github-login',
    '_blank' // <- This is what makes it open in a new window.
  );
}

const tokenConfig = token => ({
  headers: {
    Authorization: token // eslint-disable-line quote-props
  }
});

export function create_user(email, password) {
  return axios.post(backend + '/api/create_user', {
    email,
    password
  });
}

export function get_token(email, password) {
  return axios.post(backend + '/api/get_token', {
    email,
    password
  });
}

export function has_github_token(token) {
  return axios.get(backend + '/api/has_github_token', tokenConfig(token));
}

export function data_about_user(token) {
  return axios.get(backend + '/api/user', tokenConfig(token));
}

export function search_user(token, email) {
  return axios.post(backend + '/api/search_user', {
    token,
    email
  });
}

export function update_eth_account(token, email, eth_account) {
  return axios.post(backend + '/api/update_ethaccount', {
    token,
    email,
    eth_account
  });
}

export function upload_file(token, file, email) {
  return axios.post(backend + '/api/upload_image', {
    token,
    file,
    email
  });
}

export function compute_bsm(token, option_type, data, direction, trade_price) {
  return axios.post(backend + '/api/compute_bsm', {
    token,
    option_type,
    data,
    direction,
    trade_price
  });
}

export function start_delta_hedger(
  token,
  email,
  target_delta,
  time_period,
  currency,
  instrument,
  password
) {
  return axios.post(backend + '/api/start_delta_hedger', {
    token,
    email,
    target_delta,
    time_period,
    currency,
    instrument,
    password
  });
}

export function get_runnign_tasks(token, email, is_running) {
  return axios.post(backend + '/api/get_runnung_tasks', {
    token,
    email,
    is_running
  });
}

export function kill_task(token, email, pid) {
  return axios.post(backend + '/api/kill_task', {
    token,
    email,
    pid
  });
}

export function update_api_keys(token, email, api_pubkey, api_privkey, password) {
  return axios.post(backend + '/api/update_api_keys', {
    token,
    email,
    api_pubkey,
    api_privkey,
    password
  });
}

export function get_api_keys(token, email, password) {
  return axios.post(backend + '/api/get_api_keys', {
    token,
    email,
    password
  });
}

export function get_task_state(token, email, pid) {
  return axios.post(backend + '/api/get_task_state', {
    token,
    email,
    pid
  });
}

export function get_worker_state(token) {
  return axios.post(backend + '/api/get_worker_state', {
    token
  });
}

export function compute_pnl(
  token,
  email,
  range_min,
  range_max,
  step,
  risk_free,
  vola
) {
  return axios.post(backend + '/api/compute_pnl', {
    token,
    email,
    range_min,
    range_max,
    step,
    risk_free,
    vola
  });
}

export function get_hist_vola(token, email, window, timeframe, instrument) {
  return axios.post(backend + '/api/get_hist_vola', {
    token,
    email,
    window,
    timeframe,
    instrument
  });
}

export function analaize_positions(
  token,
  email,
  positions,
  range_min,
  range_max,
  step,
  risk_free,
  vola
) {
  return axios.post(backend + '/api/analaize_positions', {
    token,
    email,
    positions,
    range_min,
    range_max,
    step,
    risk_free,
    vola
  });
}

export function get_btc_contango(token) {
  return axios.post(backend + '/api/get_btc_contango', {
    token
  });
}

export function get_eth_contango(token) {
  return axios.post(backend + '/api/get_eth_contango', {
    token
  });
}

export function verify_api_keys(token, api_pubkey, api_privkey) {
  return axios.post(backend + '/api/verify_api_keys', {
    token,
    api_pubkey,
    api_privkey
  });
}
