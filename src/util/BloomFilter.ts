/* eslint-disable no-bitwise */

// This a modified version of the code from https://github.com/jasondavies/bloomfilter.js/tree/master
// tslint:disable:no-bitwise
//
// Copyright (c) 2018, Jason Davies
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
//   list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// * Neither the name of the copyright holder nor the names of its
//   contributors may be used to endorse or promote products derived from
//   this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
export function popcnt(value: number) {
  let v = value
  v -= (v >> 1) & 0x55555555
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333)
  return (((v + (v >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24
}

// a * 16777619 mod 2**32
function fnvMultiply(a: number) {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24)
}

// See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
function fnvMix(value: number) {
  let a = value
  a += a << 13
  a ^= a >>> 7
  a += a << 3
  a ^= a >>> 17
  a += a << 5
  return a & 0xffffffff
}

// Fowler/Noll/Vo hashing.
// Nonstandard variation: this function optionally takes a seed value that is incorporated
// into the offset basis. According to http://www.isthe.com/chongo/tech/comp/fnv/index.html
// "almost any offset_basis will serve so long as it is non-zero".
export function fnv1a(value: string, seed?: number): number {
  let a = 2166136261 ^ (seed || 0)
  for (let i = 0, n = value.length; i < n; i += 1) {
    const c = value.charCodeAt(i)
    const d = c & 0xff00
    if (d) {
      a = fnvMultiply(a ^ (d >> 8))
    }
    a = fnvMultiply(a ^ (c & 0xff))
  }
  return fnvMix(a)
}

export class BloomFilter {
  private m: number

  private k: number

  private locationsBuffer: Uint16Array

  private buckets: Uint8Array

  // Creates a new bloom filter.  If *m* is an array-like object, with a length
  // property, then the bloom filter is loaded with data from the array, where
  // each element is a 32-bit integer.  Otherwise, *m* should specify the
  // number of bits.  Note that *m* is rounded up to the nearest multiple of
  // 32.  *k* specifies the number of hashing functions.
  constructor() {
    let m = 8 * 1024
    const k = 8
    const n = Math.ceil(m / 8)
    m = n * 8
    this.m = m
    this.k = k

    const kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2)
    const kbuffer = new ArrayBuffer(kbytes * k)
    this.buckets = new Uint8Array(n)

    this.locationsBuffer = new Uint16Array(kbuffer)
  }

  // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
  public locations(value: string): Uint16Array {
    const a = fnv1a(value)
    const b = fnv1a(value, 872958581) // The seed value is chosen randomly
    let x = a % this.m
    for (let i = 0; i < this.k; i += 1) {
      this.locationsBuffer[i] = x < 0 ? x + this.m : x
      x = (x + b) % this.m
    }
    return this.locationsBuffer
  }

  public add(value: string): void {
    const l = this.locations(value)
    for (let i = 0; i < this.k; i += 1) {
      this.buckets[Math.floor(l[i] / 8)] |= 1 << l[i] % 8
    }
  }

  public test(value: string): boolean {
    const l = this.locations(value)
    for (let i = 0; i < this.k; i += 1) {
      const b = l[i]
      if ((this.buckets[Math.floor(b / 8)] & (1 << b % 8)) === 0) {
        return false
      }
    }
    return true
  }

  public asBytes(): Uint8Array {
    return this.buckets
  }
}

/* eslint-enable no-bitwise */
