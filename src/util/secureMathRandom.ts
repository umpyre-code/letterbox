// from https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues

export function secureMathRandom() {
  // Divide a random UInt32 by the maximum value (2^32 -1) to get a result between 0 and 1
  return window.crypto.getRandomValues(new Uint32Array(1))[0] // 4294967295;
}
