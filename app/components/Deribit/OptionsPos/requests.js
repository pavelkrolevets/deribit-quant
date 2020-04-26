export function deribit_api(currency, method, id) {
  let request = {
    index: {
      jsonrpc: '2.0',
      method: 'public/get_index',
      id: id,
      params: {
        currency: currency
      }
    },

    fut_positions: {
      jsonrpc: '2.0',
      id: id,
      method: 'private/get_positions',
      params: {
        currency: currency,
        kind: 'future'
      }
    },

    opt_positions: {
      jsonrpc: '2.0',
      id: id,
      method: 'private/get_positions',
      params: {
        currency: currency,
        kind: 'option'
      }
    },

    positions: {
      jsonrpc: '2.0',
      id: id,
      method: 'private/get_positions',
      params: {
        currency: currency
      }
    },

    account: {
      jsonrpc: '2.0',
      id: id,
      method: 'private/get_account_summary',
      params: {
        currency: currency
        // "extended" : true
      }
    },

    all_instruments: {
      jsonrpc: '2.0',
      id: id,
      method: 'public/get_instruments',
      params: {
        currency: currency,
        expired: false
      }
    }
  };

  return Promise.resolve(request[method]);
}
