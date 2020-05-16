export function deribit_api(currency, method, id, params) {
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
    },

    get_tradingview_chart_data: {
      "jsonrpc": "2.0",
      "id": id,
      "method": "public/get_tradingview_chart_data",
      "params": params,
    },

    public_data_subscribe: {
      jsonrpc: "2.0",
      method: "public/subscribe",
      id: id,
      params: {
        "channels": [params]
      }
    },

    public_data_unsubscribe: {
      jsonrpc: "2.0",
      method: "public/unsubscribe",
      id: id,
      params: {
        "channels": [params]
      }
    },
    private_data_subscribe: {
      jsonrpc: "2.0",
      method: "public/subscribe",
      id: id,
      params: {
        "channels": [params]
      }
    },

    private_data_unsubscribe: {
      jsonrpc: "2.0",
      method: "public/unsubscribe",
      id: id,
      params: {
        "channels": [params]
      }
    },
  };

  return request[method]
}
