let abi = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "name": "dataEncrypted",
        "type": "string"
      },
      {
        "name": "dataDescription",
        "type": "string"
      },
      {
        "name": "dataType",
        "type": "bytes32"
      },
      {
        "name": "checkSum",
        "type": "bytes32"
      },
      {
        "name": "dataSize",
        "type": "string"
      }
    ],
    "name": "insertMeatData",
    "outputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      }
    ],
    "name": "getMetaData",
    "outputs": [
      {
        "name": "publisher",
        "type": "address"
      },
      {
        "name": "dataEncrypted",
        "type": "string"
      },
      {
        "name": "dataDescription",
        "type": "string"
      },
      {
        "name": "dataType",
        "type": "bytes32"
      },
      {
        "name": "checkSum",
        "type": "bytes32"
      },
      {
        "name": "dataSize",
        "type": "string"
      },
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      }
    ],
    "name": "deleteMetaData",
    "outputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getMetaDataCount",
    "outputs": [
      {
        "name": "count",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "name": "dataEncrypted",
        "type": "string"
      }
    ],
    "name": "updateEncrData",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      }
    ],
    "name": "isDataId",
    "outputs": [
      {
        "name": "isIndeed",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "name": "dataDescription",
        "type": "string"
      }
    ],
    "name": "updateDataDiscr",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getMetaDataAtIndex",
    "outputs": [
      {
        "name": "dataID",
        "type": "bytes32"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "publisher",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "dataEncrypted",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "dataDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "dataType",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "checkSum",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "dataSize",
        "type": "string"
      }
    ],
    "name": "LogNewMetaData",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "publisher",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "dataEncrypted",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "dataDescription",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "dataType",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "checkSum",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "dataSize",
        "type": "string"
      }
    ],
    "name": "LogUpdateMetaData",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "dataID",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "LogDeleteMetaData",
    "type": "event"
  }
];
export default abi
