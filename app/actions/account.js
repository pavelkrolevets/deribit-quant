
export const SAVE_KEYS = 'SAVE_KEYS';

export function saveAccount(pubkey, privkey) {
  return {
    type: SAVE_KEYS,
    publicKey: pubkey,
    privateKey: privkey
  };
}
