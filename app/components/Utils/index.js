
const utils = {
  remove_leading_0x: function(val){
    if (val === undefined || val === null ) return "";
    var str = val.toString();
    if (str.startsWith("0x")) {
      return str.slice(2);
    }
  },
    add_leading_0x: function(str){
      if (!str.startsWith("0x")) {
        return "0x" + str;
      }
      return str;
  },
  removeQuotes: function(str){
    return str.replace(/^"(.*)"$/, '$1');
  },

  retrieveServerKeyID: async function (serverKeyID, signedServerKeyID, verbose = true)  {
    return new Promise((resolve, reject) => {
      const request = require('request');
      var options = {
        url: ss_endpoint_uri + "/server/" + this.remove_leading_0x(serverKeyID) + "/" + this.remove_leading_0x(signedServerKeyID),
        method: 'GET'
      };
      request(options, (error, response, body) =>{
        if (error) {
          if (verbose) this.logError(error);
          reject(error);
        }
        else if (response.statusCode !== 200) {
          if (verbose) this.logFailedResponse(response, body, options);
        }
        else {
          resolve(this.removeQuotes(body));
        }
      });
    });
  },
  //Sign the Document Key id
  signDocementKeyId: async function(account, password, dataId, clientNodeUrl){
    let payload = {"jsonrpc": "2.0", "method": "secretstore_signRawHash", "params": [account,  password, dataId], "id":1 };
    let rawResponse = await fetch(clientNodeUrl, {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    const contentSignData = await rawResponse.json();
    return contentSignData.result
  },
  //Generate the Secret Store Server key
  genSSServerKey: async function(dataID, signedDataID, threshold, SsEndpointUri, verbose = true){
    return new Promise((resolve, reject) => {
      const request = require('request');
      var options = {
        url: SsEndpointUri + "/shadow/" + this.remove_leading_0x(dataID) + "/" + this.remove_leading_0x(signedDataID) + "/" + threshold,
        method: 'POST'
      };
      request(options, (error, response, body) =>{
        if (error) {
          if (verbose) this.logError(error);
          reject(error);
        }
        else if (response.statusCode !== 200) {
          if (verbose) this.logFailedResponse(response, body, options);
        }
        else {
          resolve(this.removeQuotes(body));
        }
      });
    });
  },
  //Generate the Document key
  genDocumentKey: async function (account, password, SSserverKey, clientNodeUrl) {
    let payload = {"jsonrpc": "2.0", "method": "secretstore_generateDocumentKey", "params": [account,  password, SSserverKey], "id":1 };
    let rawResponse = await fetch(clientNodeUrl, {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    let contentDocumentKey = await rawResponse.json();
    return contentDocumentKey;
  },
  //Document encryption
  encryptString: async function (account, password, documentKey, string, clientNodeUrl) {
    let payload = {"jsonrpc": "2.0", "method": "secretstore_encrypt", "params": [account,  password, documentKey, string], "id":1 };
    let rawResponse = await fetch(clientNodeUrl, {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    let encryptedString = await rawResponse.json();
    return encryptedString;
  },

  // Store the Document key on the SS
  storeDocKeyOnSS: async function(dataID, signedDataID, commonPoint, encryptedPoint,  SsEndpointUri, verbose = true){
    return new Promise((resolve, reject) => {
      const request = require('request');
      var options = {
        url: SsEndpointUri + "/shadow/" + this.remove_leading_0x(dataID) + "/" + this.remove_leading_0x(signedDataID) + "/" + this.remove_leading_0x(commonPoint) + "/" + this.remove_leading_0x(encryptedPoint),
        method: 'POST'
      };
      request(options, (error, response, body) =>{
        if (error) {
          if (verbose) this.logError(error);
          reject(error);
        }
        else if (response.statusCode !== 200) {
          if (verbose) this.logFailedResponse(response, body, options);
        }
        else {
          resolve(this.removeQuotes(body));
        }
      });
    });
  },

  //*************************************************************************************
  //DECRYPTION
  //*************************************************************************************

  // Sign the Document Key id
  signDocementKeyIdDecrypt: async function(account, password, dataId, clientNodeUrl){
    let payload = {"jsonrpc": "2.0", "method": "secretstore_signRawHash", "params": [account,  password, dataId], "id":1 };
    let rawResponse = await fetch(clientNodeUrl, {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    const contentSignData = await rawResponse.json();
    return contentSignData.result
  },

  // Ask the Secret Store for the decryption keys
  genDecryptKey: async function(dataID, signedDataID, SsEndpointUri, verbose = true){
    return new Promise((resolve, reject) => {
      const request = require('request');
      var options = {
        url: SsEndpointUri + "/shadow/" + this.remove_leading_0x(dataID) + "/" + this.remove_leading_0x(signedDataID),
        method: 'GET'
      };
      request(options, (error, response, body) =>{
        if (error) {
          if (verbose) this.logError(error);
          reject(error);
        }
        else if (response.statusCode !== 200) {
          if (verbose) this.logFailedResponse(response, body, options);
        }
        else {
          resolve(this.removeQuotes(body));
        }
      });
    });
  },

  // Decrypt the document
  Decrypt: async function(account, password, decrypted_secret, common_point, decrypt_shadows, rawSecret, clientNodeUrl){
    let payload = {"jsonrpc": "2.0", "method": "secretstore_shadowDecrypt", "params": [account,  password, decrypted_secret, common_point, decrypt_shadows, rawSecret], "id":1 };
    let rawResponse = await fetch(clientNodeUrl, {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    const contentSignData = await rawResponse.json();
    console.log(contentSignData);
    return contentSignData.result
  },
  logError:function logError(e) {
    console.log("Error:");
    console.log(e);
  },

  logFailedResponse: function (response, body, options) {
    console.log("Request failed");
    console.log("StatusCode: " + response.statusCode);
    console.log("StatusMessage: " + response.statusMessage);
    console.log("Body: " + body);
    console.log("Request options: " + JSON.stringify(options));
  }

};

export default utils;

// export function remove_leading_0x(val) {
//   if (val === undefined || val === null ) return "";
//   var str = val.toString();
//   if (str.startsWith("0x")) {
//     return str.slice(2);
//   }
//   return str;
// }
// export function add_leading_0x(str) {
//   if (!str.startsWith("0x")) {
//     return "0x" + str;
//   }
//   return str;
// }
// export function removeEnclosingDQuotes(str) {
//   return str.replace(/^"(.*)"$/, '$1');
// }
