/**
 * SiliconSignature Crypto Module
 * SHA-256 hashing via Web Crypto API + Proof-of-Work nonce search
 */

(function (global) {
  'use strict';

  // Default difficulty target (from SPEC)
  const DEFAULT_DIFFICULTY = '0000ffff00000000000000000000000000000000000000000000000000000000';

  /**
   * Convert Uint8Array to hex string
   */
  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to Uint8Array
   */
  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * Compute SHA-256 hash of data
   * @param {Uint8Array} data - Input data
   * @returns {Promise<Uint8Array>} - 32-byte hash
   */
  async function sha256(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  /**
   * Compute double SHA-256: SHA-256(SHA-256(data))
   * @param {Uint8Array} data - Input data
   * @returns {Promise<Uint8Array>} - 32-byte hash
   */
  async function doubleSha256(data) {
    const first = await sha256(data);
    return sha256(first);
  }

  /**
   * Hash ImageData pixels (only RGB, skip alpha)
   * @param {ImageData} imageData - Canvas ImageData
   * @returns {Promise<Uint8Array>} - 32-byte SHA-256 hash
   */
  async function hashImageData(imageData) {
    const pixels = imageData.data;
    // Extract only RGB channels (skip alpha) for consistent hashing
    const rgbData = new Uint8Array(pixels.length * 3 / 4);
    let idx = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      rgbData[idx++] = pixels[i];     // R
      rgbData[idx++] = pixels[i + 1]; // G
      rgbData[idx++] = pixels[i + 2]; // B
    }
    return sha256(rgbData);
  }

  /**
   * Compare two byte arrays as big-endian integers
   * Returns: negative if a < b, 0 if equal, positive if a > b
   */
  function compareBytes(a, b) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] !== b[i]) return a[i] - b[i];
    }
    return a.length - b.length;
  }

  /**
   * Search for a nonce satisfying: SHA-256(SHA-256(hash || nonce)) < difficulty
   * Uses CPU-based proof of work with configurable batch size for UI responsiveness.
   *
   * @param {Uint8Array} imageHash - 32-byte image hash
   * @param {string} difficulty - 64-char hex difficulty target
   * @param {object} options - { onProgress, onNonceFound, batchSize }
   * @returns {Promise<{nonce: string, ntime: string, hash: string}>}
   */
  async function searchNonce(imageHash, difficulty, options = {}) {
    const {
      onProgress = null,
      onNonceFound = null,
      batchSize = 10000
    } = options;

    const targetBytes = hexToBytes(difficulty || DEFAULT_DIFFICULTY);
    let nonce = 0;
    const startTime = Date.now();
    const maxNonce = 0xFFFFFFFF;

    // Batch processing to allow UI updates
    while (nonce <= maxNonce) {
      const batchStart = nonce;
      const batchEnd = Math.min(nonce + batchSize, maxNonce);

      for (let n = batchStart; n <= batchEnd; n++) {
        // Build input: hash || nonce (4 bytes BE)
        const input = new Uint8Array(36);
        input.set(imageHash, 0);
        input[32] = (n >>> 24) & 0xFF;
        input[33] = (n >>> 16) & 0xFF;
        input[34] = (n >>> 8) & 0xFF;
        input[35] = n & 0xFF;

        // Double SHA-256 (synchronously using a synchronous fallback)
        const hash = doubleSha256Sync(input);

        // Check if hash < target
        if (compareBytes(hash, targetBytes) < 0) {
          const nonceHex = n.toString(16).padStart(8, '0');
          const ntimeHex = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
          const hashHex = bytesToHex(hash);

          if (onNonceFound) {
            onNonceFound({ nonce: nonceHex, ntime: ntimeHex, hash: hashHex });
          }

          return {
            nonce: nonceHex,
            ntime: ntimeHex,
            hash: hashHex,
            attempts: n - batchStart + 1
          };
        }
      }

      nonce = batchEnd + 1;

      // Progress callback
      if (onProgress && nonce % (batchSize * 10) === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const hashRate = elapsed > 0 ? nonce / elapsed : 0;
        onProgress({
          attempts: nonce,
          elapsed,
          hashRate: Math.round(hashRate),
          progress: Math.min(100, (nonce / maxNonce) * 100)
        });

        // Yield to UI
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // Exhausted search space without finding nonce
    throw new Error('Nonce search space exhausted');
  }

  /**
   * Synchronous double SHA-256 using a pure JS fallback (for PoW performance).
   * For the actual signing we use async Web Crypto, but for PoW brute force
   * we need synchronous computation.
   */
  function doubleSha256Sync(data) {
    const hash1 = jsSha256(data);
    return jsSha256(hash1);
  }

  /**
   * Pure JavaScript SHA-256 implementation for synchronous use during PoW.
   * This is needed because crypto.subtle is async and would be too slow
   * for the tight PoW loop.
   */
  function jsSha256(data) {
    // SHA-256 constants
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    // Initial hash values
    const H = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);

    // Pre-processing: pad the message
    const bitLen = data.length * 8;
    const paddedLen = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(data, 0);
    padded[data.length] = 0x80;
    // Append length in bits as 64-bit big-endian
    const dv = new DataView(padded.buffer);
    dv.setUint32(paddedLen - 4, bitLen, false);

    // Process each 512-bit chunk
    const W = new Uint32Array(64);
    for (let chunk = 0; chunk < paddedLen; chunk += 64) {
      // Copy chunk into first 16 words
      for (let i = 0; i < 16; i++) {
        W[i] = dv.getUint32(chunk + i * 4, false);
      }

      // Extend to 64 words
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }

      // Working variables
      let [a, b, c, d, e, f, g, h] = H;

      // Main loop
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + W[i]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      // Add to hash
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
      H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0;
      H[7] = (H[7] + h) | 0;
    }

    // Produce final 32-byte hash
    const result = new Uint8Array(32);
    const rdv = new DataView(result.buffer);
    for (let i = 0; i < 8; i++) {
      rdv.setUint32(i * 4, H[i], false);
    }
    return result;
  }

  function rotr(x, n) {
    return (x >>> n) | (x << (32 - n));
  }

  /**
   * Verify that a nonce satisfies the PoW condition.
   * @param {Uint8Array} imageHash - Original image hash
   * @param {string} nonce - 8-char hex nonce
   * @param {string} difficulty - 64-char hex difficulty
   * @returns {boolean}
   */
  async function verifyNonce(imageHash, nonce, difficulty) {
    const nonceNum = parseInt(nonce, 16);
    const targetBytes = hexToBytes(difficulty || DEFAULT_DIFFICULTY);

    const input = new Uint8Array(36);
    input.set(imageHash, 0);
    input[32] = (nonceNum >>> 24) & 0xFF;
    input[33] = (nonceNum >>> 16) & 0xFF;
    input[34] = (nonceNum >>> 8) & 0xFF;
    input[35] = nonceNum & 0xFF;

    const hash = await doubleSha256(input);
    return compareBytes(hash, targetBytes) < 0;
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const CryptoModule = {
    sha256,
    doubleSha256,
    hashImageData,
    searchNonce,
    verifyNonce,
    bytesToHex,
    hexToBytes,
    compareBytes,
    doubleSha256Sync,
    jsSha256,
    DEFAULT_DIFFICULTY
  };

  // AMD
  if (typeof define === 'function' && define.amd) {
    define(function () { return CryptoModule; });
  }
  // CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoModule;
  }
  // Global (browser, worker, node)
  global.SiliconCrypto = CryptoModule;
  if (typeof globalThis !== 'undefined') globalThis.SiliconCrypto = CryptoModule;

})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : this);
