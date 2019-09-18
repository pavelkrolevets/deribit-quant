/* eslint camelcase: 0 */

import axios from 'axios';

const tokenConfig = (token) => ({
    headers: {
        'Authorization': token, // eslint-disable-line quote-props
    },
});

export function validate_token(token) {
    return axios.post('http://localhost:5000/api/is_token_valid', {
        token,
    });
}

export function get_github_access() {
    window.open(
        '/github-login',
        '_blank' // <- This is what makes it open in a new window.
    );
}

export function create_user(email, password) {
    return axios.post('http://localhost:5000/api/create_user', {
        email,
        password,
    });
}

export function get_token(email, password) {
    return axios.post('http://localhost:5000/api/get_token', {
        email,
        password,
    });
}

export function has_github_token(token) {
    return axios.get('http://localhost:5000/api/has_github_token', tokenConfig(token));
}

export function data_about_user(token) {
    return axios.get('http://localhost:5000/api/user', tokenConfig(token));
}

export function search_user(token, email) {
  return axios.post('http://localhost:5000/api/search_user', {
    token,
    email
  });
}

export function update_eth_account(token, email, eth_account) {
  return axios.post('http://localhost:5000/api/update_ethaccount', {
    token,
    email,
    eth_account,
  });
}

export function upload_file(token, file, email) {
  return axios.post('http://localhost:5000/api/upload_image', {
    token,
    file,
    email
  });
}

export function compute_bsm(token,option_type, data) {
  return axios.post('http://localhost:5000/api/compute_bsm', {
    token,
    option_type,
    data
  });
}

export function start_delta_hedger(token, email) {
  return axios.post('http://localhost:5000/api/start_delta_hedger', {
    token,
    email
  });
}

export function get_tasks(token, email) {
  return axios.post('http://localhost:5000/api/get_tasks', {
    token,
    email
  });
}

export function kill_task(token, email, pid) {
  return axios.post('http://localhost:5000/api/kill_task', {
    token,
    email,
    pid
  });
}
