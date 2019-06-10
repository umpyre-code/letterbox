import _sodium = require('libsodium-wrappers')

export default class Sodium {
  public handle: typeof _sodium

  public async init() {
    await _sodium.ready
    this.handle = _sodium
  }
}
