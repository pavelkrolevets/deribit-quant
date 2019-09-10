import sha256 from 'crypto-js/sha256';

export default async function Encrypt (string, owner_addr, password, web3) {
  // this.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  web3.personal.unlockAccount(web3.toChecksumAddress(owner_addr), password);
  const dataID = sha256(string);
  console.log(dataID);
  const payload = {"jsonrpc": "2.0", "method": "secretstore_signRawHash", "params": [owner_addr, password, "0x"+web3.utils.toHex(dataID)], "id":1 };
  (async () => {
    const rawResponse = await fetch("http://127.0.0.1:8545", {
      method: 'POST',
      headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
      body: JSON.stringify(payload)
    });
    const content = await rawResponse.json();
    console.log(content);
  })();
}
