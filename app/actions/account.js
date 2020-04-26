export const STORE_DERIBIT_KEYS = 'STORE_DERIBIT_KEYS';

export function storeDeribitAccount(pubkey, privkey) {
  return {
    type: STORE_DERIBIT_KEYS,
    publicKey: pubkey,
    privateKey: privkey
  };
}
