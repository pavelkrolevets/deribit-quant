let abi = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_docOwner",
        "type": "address"
      },
      {
        "name": "_documentId",
        "type": "bytes32"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_documentId",
        "type": "bytes32"
      },
      {
        "name": "doc_price",
        "type": "uint256"
      }
    ],
    "name": "publish",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_publisher",
        "type": "address"
      },
      {
        "name": "_documentId",
        "type": "bytes32"
      }
    ],
    "name": "releaseEscrow",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_publisher",
        "type": "address"
      },
      {
        "name": "_consumer",
        "type": "address"
      },
      {
        "name": "_documentId",
        "type": "bytes32"
      }
    ],
    "name": "checkDeposit",
    "outputs": [
      {
        "name": "deposit",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_publisher",
        "type": "address"
      },
      {
        "name": "_documentId",
        "type": "bytes32"
      }
    ],
    "name": "checkDocPrice",
    "outputs": [
      {
        "name": "price",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_grantee",
        "type": "address"
      },
      {
        "name": "_documentId",
        "type": "bytes32"
      }
    ],
    "name": "checkPermissions",
    "outputs": [
      {
        "name": "permissionGranted",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];
export default abi
