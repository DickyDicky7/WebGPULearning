//  ```typescript
//  ```typescript
//  @ts-nocheck
//  @ts-nocheck



    import * as fflate from "fflate";
//  import * as fflate from "fflate";



    const FloatType = 1015;
//  const FloatType = 1015;
    const HalfFloatType = 1016;
//  const HalfFloatType = 1016;
    const RGBAFormat = 1023;
//  const RGBAFormat = 1023;
    const RedFormat = 1028;
//  const RedFormat = 1028;
    const NoColorSpace = "";
//  const NoColorSpace = "";
    const LinearSRGBColorSpace = "srgb-linear";
//  const LinearSRGBColorSpace = "srgb-linear";



//  Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf
//  Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf



    const _tables = /*@__PURE__*/ _generateTables();
//  const _tables = /*@__PURE__*/ _generateTables();



    function _generateTables() {
//  function _generateTables() {
        //  float32 to float16 helpers
        //  float32 to float16 helpers

        const buffer = new ArrayBuffer(4);
//      const buffer = new ArrayBuffer(4);
        const floatView = new Float32Array(buffer);
//      const floatView = new Float32Array(buffer);
        const uint32View = new Uint32Array(buffer);
//      const uint32View = new Uint32Array(buffer);

        const baseTable = new Uint32Array(512);
//      const baseTable = new Uint32Array(512);
        const shiftTable = new Uint32Array(512);
//      const shiftTable = new Uint32Array(512);

        for (let i = 0; i < 256; ++i) {
//      for (let i = 0; i < 256; ++i) {
            const e = i - 127;
//          const e = i - 127;

            //  very small number (0, -0)
            //  very small number (0, -0)

            if (e < -27) {
//          if (e < -27) {
                baseTable[i] = 0x0000;
//              baseTable[i] = 0x0000;
                baseTable[i | 0x100] = 0x8000;
//              baseTable[i | 0x100] = 0x8000;
                shiftTable[i] = 24;
//              shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
//              shiftTable[i | 0x100] = 24;

            //  small number (denorm)
            //  small number (denorm)
            } else if (e < -14) {
//          } else if (e < -14) {
                baseTable[i] = 0x0400 >> (-e - 14);
//              baseTable[i] = 0x0400 >> (-e - 14);
                baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
//              baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
                shiftTable[i] = -e - 1;
//              shiftTable[i] = -e - 1;
                shiftTable[i | 0x100] = -e - 1;
//              shiftTable[i | 0x100] = -e - 1;

            //  normal number
            //  normal number
            } else if (e <= 15) {
//          } else if (e <= 15) {
                baseTable[i] = (e + 15) << 10;
//              baseTable[i] = (e + 15) << 10;
                baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
//              baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
                shiftTable[i] = 13;
//              shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
//              shiftTable[i | 0x100] = 13;

            //  large number (Infinity, -Infinity)
            //  large number (Infinity, -Infinity)
            } else if (e < 128) {
//          } else if (e < 128) {
                baseTable[i] = 0x7c00;
//              baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
//              baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 24;
//              shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
//              shiftTable[i | 0x100] = 24;

            //  stay (NaN, Infinity, -Infinity)
            //  stay (NaN, Infinity, -Infinity)
            } else {
//          } else {
                baseTable[i] = 0x7c00;
//              baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
//              baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 13;
//              shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
//              shiftTable[i | 0x100] = 13;
            }
//          }
        }
//      }

        //  float16 to float32 helpers
        //  float16 to float32 helpers

        const mantissaTable = new Uint32Array(2048);
//      const mantissaTable = new Uint32Array(2048);
        const exponentTable = new Uint32Array(64);
//      const exponentTable = new Uint32Array(64);
        const offsetTable = new Uint32Array(64);
//      const offsetTable = new Uint32Array(64);

        for (let i = 1; i < 1024; ++i) {
//      for (let i = 1; i < 1024; ++i) {
            let m = i << 13; // zero pad mantissa bits
//          let m = i << 13; // zero pad mantissa bits
            let e = 0; // zero exponent
//          let e = 0; // zero exponent

            //  normalized
            //  normalized
            while ((m & 0x00800000) === 0) {
//          while ((m & 0x00800000) === 0) {
                m <<= 1;
//              m <<= 1;
                e -= 0x00800000; // decrement exponent
//              e -= 0x00800000; // decrement exponent
            }
//          }

            m &= ~0x00800000; // clear leading 1 bit
//          m &= ~0x00800000; // clear leading 1 bit
            e += 0x38800000; // adjust bias
//          e += 0x38800000; // adjust bias

            mantissaTable[i] = m | e;
//          mantissaTable[i] = m | e;
        }
//      }

        for (let i = 1024; i < 2048; ++i) {
//      for (let i = 1024; i < 2048; ++i) {
            mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
//          mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
        }
//      }

        for (let i = 1; i < 31; ++i) {
//      for (let i = 1; i < 31; ++i) {
            exponentTable[i] = i << 23;
//          exponentTable[i] = i << 23;
        }
//      }

        exponentTable[31] = 0x47800000;
//      exponentTable[31] = 0x47800000;
        exponentTable[32] = 0x80000000;
//      exponentTable[32] = 0x80000000;

        for (let i = 33; i < 63; ++i) {
//      for (let i = 33; i < 63; ++i) {
            exponentTable[i] = 0x80000000 + ((i - 32) << 23);
//          exponentTable[i] = 0x80000000 + ((i - 32) << 23);
        }
//      }

        exponentTable[63] = 0xc7800000;
//      exponentTable[63] = 0xc7800000;

        for (let i = 1; i < 64; ++i) {
//      for (let i = 1; i < 64; ++i) {
            if (i !== 32) {
//          if (i !== 32) {
                offsetTable[i] = 1024;
//              offsetTable[i] = 1024;
            }
//          }
        }
//      }

        return {
//      return {
            floatView: floatView,
//          floatView: floatView,
            uint32View: uint32View,
//          uint32View: uint32View,
            baseTable: baseTable,
//          baseTable: baseTable,
            shiftTable: shiftTable,
//          shiftTable: shiftTable,
            mantissaTable: mantissaTable,
//          mantissaTable: mantissaTable,
            exponentTable: exponentTable,
//          exponentTable: exponentTable,
            offsetTable: offsetTable,
//          offsetTable: offsetTable,
        };
//      };
    }
//  }



    const DataUtils = {
//  const DataUtils = {
        toHalfFloat(val) {
//      toHalfFloat(val) {
            if (Math.abs(val) > 65504)
//          if (Math.abs(val) > 65504)
                console.warn("DataUtils.toHalfFloat(): Value out of range.");
//              console.warn("DataUtils.toHalfFloat(): Value out of range.");

            val = Math.max(-65504, Math.min(val, 65504));
//          val = Math.max(-65504, Math.min(val, 65504));

            _tables.floatView[0] = val;
//          _tables.floatView[0] = val;
            const f = _tables.uint32View[0];
//          const f = _tables.uint32View[0];
            const e = (f >> 23) & 0x1ff;
//          const e = (f >> 23) & 0x1ff;
            return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
//          return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
        },
//      },
    };
//  };



// /**
// /**
//  * OpenEXR loader currently supports uncompressed, ZIP(S), RLE, PIZ and DWA/B compression.
//  * OpenEXR loader currently supports uncompressed, ZIP(S), RLE, PIZ and DWA/B compression.
//  * Supports reading as UnsignedByte, HalfFloat and Float type data texture.
//  * Supports reading as UnsignedByte, HalfFloat and Float type data texture.
//  *
//  *
//  * Referred to the original Industrial Light & Magic OpenEXR implementation and the TinyEXR / Syoyo Fujita
//  * Referred to the original Industrial Light & Magic OpenEXR implementation and the TinyEXR / Syoyo Fujita
//  * implementation, so I have preserved their copyright notices.
//  * implementation, so I have preserved their copyright notices.
//  */
//  */



// /*
// /*
// Copyright (c) 2014 - 2017, Syoyo Fujita
// Copyright (c) 2014 - 2017, Syoyo Fujita
// All rights reserved.
// All rights reserved.



// Redistribution and use in source and binary forms, with or without
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// modification, are permitted provided that the following conditions are met:
//     * Redistributions of source code must retain the above copyright
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Syoyo Fujita nor the
//     * Neither the name of the Syoyo Fujita nor the
//       names of its contributors may be used to endorse or promote products
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//       derived from this software without specific prior written permission.



// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// */
// */



// // TinyEXR contains some OpenEXR code, which is licensed under ------------
// // TinyEXR contains some OpenEXR code, which is licensed under ------------



// ///////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////
// //
// //
// // Copyright (c) 2002, Industrial Light & Magic, a division of Lucas
// // Copyright (c) 2002, Industrial Light & Magic, a division of Lucas
// // Digital Ltd. LLC
// // Digital Ltd. LLC
// //
// //
// // All rights reserved.
// // All rights reserved.
// //
// //
// // Redistribution and use in source and binary forms, with or without
// // Redistribution and use in source and binary forms, with or without
// // modification, are permitted provided that the following conditions are
// // modification, are permitted provided that the following conditions are
// // met:
// // met:
// // *       Redistributions of source code must retain the above copyright
// // *       Redistributions of source code must retain the above copyright
// // notice, this list of conditions and the following disclaimer.
// // notice, this list of conditions and the following disclaimer.
// // *       Redistributions in binary form must reproduce the above
// // *       Redistributions in binary form must reproduce the above
// // copyright notice, this list of conditions and the following disclaimer
// // copyright notice, this list of conditions and the following disclaimer
// // in the documentation and/or other materials provided with the
// // in the documentation and/or other materials provided with the
// // distribution.
// // distribution.
// // *       Neither the name of Industrial Light & Magic nor the names of
// // *       Neither the name of Industrial Light & Magic nor the names of
// // its contributors may be used to endorse or promote products derived
// // its contributors may be used to endorse or promote products derived
// // from this software without specific prior written permission.
// // from this software without specific prior written permission.
// //
// //
// // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// // THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// // "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// // LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// // OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// // LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// // THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// // (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// // OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// //
// //
// ///////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////



// // End of OpenEXR license -------------------------------------------------
// // End of OpenEXR license -------------------------------------------------



/**
 * @typedef EXRData
 * @typedef EXRData
 * @property {object} header
 * @property {object} header
 * @property {number} width
 * @property {number} width
 * @property {number} height
 * @property {number} height
 * @property {Uint16Array|Float32Array} data
 * @property {Uint16Array|Float32Array} data
 * @property {1023|1028} format RGBAFormat (1023) or RedFormat (1028)
 * @property {1023|1028} format RGBAFormat (1023) or RedFormat (1028)
 * @property {""|"srgb-linear"} colorSpace
 * @property {""|"srgb-linear"} colorSpace
 */
    export interface EXRData {
//  export interface EXRData {
        header: object;
//      header: object;
        width: number;
//      width: number;
        height: number;
//      height: number;
        data: Uint16Array | Float32Array;
//      data: Uint16Array | Float32Array;
        format: 1023 | 1028; // RGBAFormat (1023) or RedFormat (1028)
//      format: 1023 | 1028; // RGBAFormat (1023) or RedFormat (1028)
        colorSpace: "" | "srgb-linear";
//      colorSpace: "" | "srgb-linear";
    }
//  }



/**
 * Parse a buffer and return EXR data
 * Parse a buffer and return EXR data
 * @param {ArrayBuffer} buffer
 * @param {ArrayBuffer} buffer
 * @param {1015|1016} [type=1016] Float (1015) or Half Float (1016)
 * @param {1015|1016} [type=1016] Float (1015) or Half Float (1016)
 * @returns {EXRData}
 * @returns {EXRData}
 */
    export function parseEXR(buffer: ArrayBuffer, type: 1015 | 1016 = HalfFloatType): EXRData {
//  export function parseEXR(buffer: ArrayBuffer, type: 1015 | 1016 = HalfFloatType): EXRData {
        const USHORT_RANGE = 1 << 16;
//      const USHORT_RANGE = 1 << 16;
        const BITMAP_SIZE = USHORT_RANGE >> 3;
//      const BITMAP_SIZE = USHORT_RANGE >> 3;

        const HUF_ENCBITS = 16; // literal (value) bit length
//      const HUF_ENCBITS = 16; // literal (value) bit length
        const HUF_DECBITS = 14; // decoding bit size (>= 8)
//      const HUF_DECBITS = 14; // decoding bit size (>= 8)

        const HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1; // encoding table size
//      const HUF_ENCSIZE = (1 << HUF_ENCBITS) + 1; // encoding table size
        const HUF_DECSIZE = 1 << HUF_DECBITS; // decoding table size
//      const HUF_DECSIZE = 1 << HUF_DECBITS; // decoding table size
        const HUF_DECMASK = HUF_DECSIZE - 1;
//      const HUF_DECMASK = HUF_DECSIZE - 1;

        const NBITS = 16;
//      const NBITS = 16;
        const A_OFFSET = 1 << (NBITS - 1);
//      const A_OFFSET = 1 << (NBITS - 1);
        const MOD_MASK = (1 << NBITS) - 1;
//      const MOD_MASK = (1 << NBITS) - 1;

        const SHORT_ZEROCODE_RUN = 59;
//      const SHORT_ZEROCODE_RUN = 59;
        const LONG_ZEROCODE_RUN = 63;
//      const LONG_ZEROCODE_RUN = 63;
        const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;
//      const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;

        const ULONG_SIZE = 8;
//      const ULONG_SIZE = 8;
        const FLOAT32_SIZE = 4;
//      const FLOAT32_SIZE = 4;
        const INT32_SIZE = 4;
//      const INT32_SIZE = 4;
        const INT16_SIZE = 2;
//      const INT16_SIZE = 2;
        const INT8_SIZE = 1;
//      const INT8_SIZE = 1;

        const STATIC_HUFFMAN = 0;
//      const STATIC_HUFFMAN = 0;
        const DEFLATE = 1;
//      const DEFLATE = 1;

        const UNKNOWN = 0;
//      const UNKNOWN = 0;
        const LOSSY_DCT = 1;
//      const LOSSY_DCT = 1;
        const RLE = 2;
//      const RLE = 2;



        const logBase = Math.pow(2.7182818, 2.2);
//      const logBase = Math.pow(2.7182818, 2.2);



    function reverseLutFromBitmap(bitmap, lut) {
//  function reverseLutFromBitmap(bitmap, lut) {
        let k = 0;
//      let k = 0;

        for (let i = 0; i < USHORT_RANGE; ++i) {
//      for (let i = 0; i < USHORT_RANGE; ++i) {
            if (i == 0 || bitmap[i >> 3] & (1 << (i & 7))) {
//          if (i == 0 || bitmap[i >> 3] & (1 << (i & 7))) {
                lut[k++] = i;
//              lut[k++] = i;
            }
//          }
        }
//      }

        const n = k - 1;
//      const n = k - 1;

        while (k < USHORT_RANGE) lut[k++] = 0;
//      while (k < USHORT_RANGE) lut[k++] = 0;

        return n;
//      return n;
    }
//  }



    function hufClearDecTable(hdec) {
//  function hufClearDecTable(hdec) {
        for (let i = 0; i < HUF_DECSIZE; i++) {
//      for (let i = 0; i < HUF_DECSIZE; i++) {
            hdec[i] = {};
//          hdec[i] = {};
            hdec[i].len = 0;
//          hdec[i].len = 0;
            hdec[i].lit = 0;
//          hdec[i].lit = 0;
            hdec[i].p = null;
//          hdec[i].p = null;
        }
//      }
    }
//  }



    const getBitsReturn = { l: 0, c: 0, lc: 0 };
//  const getBitsReturn = { l: 0, c: 0, lc: 0 };



    function getBits(nBits, c, lc, uInt8Array, inOffset) {
//  function getBits(nBits, c, lc, uInt8Array, inOffset) {
        while (lc < nBits) {
//      while (lc < nBits) {
            c = (c << 8) | parseUint8Array(uInt8Array, inOffset);
//          c = (c << 8) | parseUint8Array(uInt8Array, inOffset);
            lc += 8;
//          lc += 8;
        }
//      }

        lc -= nBits;
//      lc -= nBits;

        getBitsReturn.l = (c >> lc) & ((1 << nBits) - 1);
//      getBitsReturn.l = (c >> lc) & ((1 << nBits) - 1);
        getBitsReturn.c = c;
//      getBitsReturn.c = c;
        getBitsReturn.lc = lc;
//      getBitsReturn.lc = lc;
    }
//  }



    const hufTableBuffer = new Array(59);
//  const hufTableBuffer = new Array(59);



    function hufCanonicalCodeTable(hcode) {
//  function hufCanonicalCodeTable(hcode) {
        for (let i = 0; i <= 58; ++i) hufTableBuffer[i] = 0;
//      for (let i = 0; i <= 58; ++i) hufTableBuffer[i] = 0;
        for (let i = 0; i < HUF_ENCSIZE; ++i) hufTableBuffer[hcode[i]] += 1;
//      for (let i = 0; i < HUF_ENCSIZE; ++i) hufTableBuffer[hcode[i]] += 1;

        let c = 0;
//      let c = 0;

        for (let i = 58; i > 0; --i) {
//      for (let i = 58; i > 0; --i) {
            const nc = (c + hufTableBuffer[i]) >> 1;
//          const nc = (c + hufTableBuffer[i]) >> 1;
            hufTableBuffer[i] = c;
//          hufTableBuffer[i] = c;
            c = nc;
//          c = nc;
        }
//      }

        for (let i = 0; i < HUF_ENCSIZE; ++i) {
//      for (let i = 0; i < HUF_ENCSIZE; ++i) {
            const l = hcode[i];
//          const l = hcode[i];
            if (l > 0) hcode[i] = l | (hufTableBuffer[l]++ << 6);
//          if (l > 0) hcode[i] = l | (hufTableBuffer[l]++ << 6);
        }
//      }
    }
//  }



    function hufUnpackEncTable(uInt8Array, inOffset, ni, im, iM, hcode) {
//  function hufUnpackEncTable(uInt8Array, inOffset, ni, im, iM, hcode) {
        const p = inOffset;
//      const p = inOffset;
        let c = 0;
//      let c = 0;
        let lc = 0;
//      let lc = 0;

        for (; im <= iM; im++) {
//      for (; im <= iM; im++) {
            if (p.value - inOffset.value > ni) return false;
//          if (p.value - inOffset.value > ni) return false;

            getBits(6, c, lc, uInt8Array, p);
//          getBits(6, c, lc, uInt8Array, p);

            const l = getBitsReturn.l;
//          const l = getBitsReturn.l;
            c = getBitsReturn.c;
//          c = getBitsReturn.c;
            lc = getBitsReturn.lc;
//          lc = getBitsReturn.lc;

            hcode[im] = l;
//          hcode[im] = l;

            if (l == LONG_ZEROCODE_RUN) {
//          if (l == LONG_ZEROCODE_RUN) {
                if (p.value - inOffset.value > ni) {
//              if (p.value - inOffset.value > ni) {
                    throw new Error("Something wrong with hufUnpackEncTable");
//                  throw new Error("Something wrong with hufUnpackEncTable");
                }
//              }

                getBits(8, c, lc, uInt8Array, p);
//              getBits(8, c, lc, uInt8Array, p);

                let zerun = getBitsReturn.l + SHORTEST_LONG_RUN;
//              let zerun = getBitsReturn.l + SHORTEST_LONG_RUN;
                c = getBitsReturn.c;
//              c = getBitsReturn.c;
                lc = getBitsReturn.lc;
//              lc = getBitsReturn.lc;

                if (im + zerun > iM + 1) {
//              if (im + zerun > iM + 1) {
                    throw new Error("Something wrong with hufUnpackEncTable");
//                  throw new Error("Something wrong with hufUnpackEncTable");
                }
//              }

                while (zerun--) hcode[im++] = 0;
//              while (zerun--) hcode[im++] = 0;

                im--;
//              im--;
            } else if (l >= SHORT_ZEROCODE_RUN) {
//          } else if (l >= SHORT_ZEROCODE_RUN) {
                let zerun = l - SHORT_ZEROCODE_RUN + 2;
//              let zerun = l - SHORT_ZEROCODE_RUN + 2;

                if (im + zerun > iM + 1) {
//              if (im + zerun > iM + 1) {
                    throw new Error("Something wrong with hufUnpackEncTable");
//                  throw new Error("Something wrong with hufUnpackEncTable");
                }
//              }

                while (zerun--) hcode[im++] = 0;
//              while (zerun--) hcode[im++] = 0;

                im--;
//              im--;
            }
//          }
        }
//      }

        hufCanonicalCodeTable(hcode);
//      hufCanonicalCodeTable(hcode);
    }
//  }



    function hufLength(code) {
//  function hufLength(code) {
        return code & 63;
//      return code & 63;
    }
//  }



    function hufCode(code) {
//  function hufCode(code) {
        return code >> 6;
//      return code >> 6;
    }
//  }



    function hufBuildDecTable(hcode, im, iM, hdecod) {
//  function hufBuildDecTable(hcode, im, iM, hdecod) {
        for (; im <= iM; im++) {
//      for (; im <= iM; im++) {
            const c = hufCode(hcode[im]);
//          const c = hufCode(hcode[im]);
            const l = hufLength(hcode[im]);
//          const l = hufLength(hcode[im]);

            if (c >> l) {
//          if (c >> l) {
                throw new Error("Invalid table entry");
//              throw new Error("Invalid table entry");
            }
//          }

            if (l > HUF_DECBITS) {
//          if (l > HUF_DECBITS) {
                const pl = hdecod[c >> (l - HUF_DECBITS)];
//              const pl = hdecod[c >> (l - HUF_DECBITS)];

                if (pl.len) {
//              if (pl.len) {
                    throw new Error("Invalid table entry");
//                  throw new Error("Invalid table entry");
                }
//              }

                pl.lit++;
//              pl.lit++;

                if (pl.p) {
//              if (pl.p) {
                    const p = pl.p;
//                  const p = pl.p;
                    pl.p = new Array(pl.lit);
//                  pl.p = new Array(pl.lit);

                    for (let i = 0; i < pl.lit - 1; ++i) {
//                  for (let i = 0; i < pl.lit - 1; ++i) {
                        pl.p[i] = p[i];
//                      pl.p[i] = p[i];
                    }
//                  }
                } else {
//              } else {
                    pl.p = new Array(1);
//                  pl.p = new Array(1);
                }
//              }

                pl.p[pl.lit - 1] = im;
//              pl.p[pl.lit - 1] = im;
            } else if (l) {
//          } else if (l) {
                let plOffset = 0;
//              let plOffset = 0;

                for (let i = 1 << (HUF_DECBITS - l); i > 0; i--) {
//              for (let i = 1 << (HUF_DECBITS - l); i > 0; i--) {
                    const pl = hdecod[(c << (HUF_DECBITS - l)) + plOffset];
//                  const pl = hdecod[(c << (HUF_DECBITS - l)) + plOffset];

                    if (pl.len || pl.p) {
//                  if (pl.len || pl.p) {
                        throw new Error("Invalid table entry");
//                      throw new Error("Invalid table entry");
                    }
//                  }

                    pl.len = l;
//                  pl.len = l;
                    pl.lit = im;
//                  pl.lit = im;

                    plOffset++;
//                  plOffset++;
                }
//              }
            }
//          }
        }
//      }

        return true;
//      return true;
    }
//  }



    const getCharReturn = { c: 0, lc: 0 };
//  const getCharReturn = { c: 0, lc: 0 };



    function getChar(c, lc, uInt8Array, inOffset) {
//  function getChar(c, lc, uInt8Array, inOffset) {
        c = (c << 8) | parseUint8Array(uInt8Array, inOffset);
//      c = (c << 8) | parseUint8Array(uInt8Array, inOffset);
        lc += 8;
//      lc += 8;

        getCharReturn.c = c;
//      getCharReturn.c = c;
        getCharReturn.lc = lc;
//      getCharReturn.lc = lc;
    }
//  }



    const getCodeReturn = { c: 0, lc: 0 };
//  const getCodeReturn = { c: 0, lc: 0 };



    function getCode(
//  function getCode(
        po,
//      po,
        rlc,
//      rlc,
        c,
//      c,
        lc,
//      lc,
        uInt8Array,
//      uInt8Array,
        inOffset,
//      inOffset,
        outBuffer,
//      outBuffer,
        outBufferOffset,
//      outBufferOffset,
        outBufferEndOffset,
//      outBufferEndOffset,
    ) {
//  ) {
        if (po == rlc) {
//      if (po == rlc) {
            if (lc < 8) {
//          if (lc < 8) {
                getChar(c, lc, uInt8Array, inOffset);
//              getChar(c, lc, uInt8Array, inOffset);
                c = getCharReturn.c;
//              c = getCharReturn.c;
                lc = getCharReturn.lc;
//              lc = getCharReturn.lc;
            }
//          }

            lc -= 8;
//          lc -= 8;

            let cs = c >> lc;
//          let cs = c >> lc;
            cs = new Uint8Array([cs])[0];
//          cs = new Uint8Array([cs])[0];

            if (outBufferOffset.value + cs > outBufferEndOffset) {
//          if (outBufferOffset.value + cs > outBufferEndOffset) {
                return false;
//              return false;
            }
//          }

            const s = outBuffer[outBufferOffset.value - 1];
//          const s = outBuffer[outBufferOffset.value - 1];

            while (cs-- > 0) {
//          while (cs-- > 0) {
                outBuffer[outBufferOffset.value++] = s;
//              outBuffer[outBufferOffset.value++] = s;
            }
//          }
        } else if (outBufferOffset.value < outBufferEndOffset) {
//      } else if (outBufferOffset.value < outBufferEndOffset) {
            outBuffer[outBufferOffset.value++] = po;
//          outBuffer[outBufferOffset.value++] = po;
        } else {
//      } else {
            return false;
//          return false;
        }
//      }

        getCodeReturn.c = c;
//      getCodeReturn.c = c;
        getCodeReturn.lc = lc;
//      getCodeReturn.lc = lc;
    }
//  }



    function UInt16(value) {
//  function UInt16(value) {
        return value & 0xffff;
//      return value & 0xffff;
    }
//  }



    function Int16(value) {
//  function Int16(value) {
        const ref = UInt16(value);
//      const ref = UInt16(value);
        return ref > 0x7fff ? ref - 0x10000 : ref;
//      return ref > 0x7fff ? ref - 0x10000 : ref;
    }
//  }



    const wdec14Return = { a: 0, b: 0 };
//  const wdec14Return = { a: 0, b: 0 };



    function wdec14(l, h) {
//  function wdec14(l, h) {
        const ls = Int16(l);
//      const ls = Int16(l);
        const hs = Int16(h);
//      const hs = Int16(h);

        const hi = hs;
//      const hi = hs;
        const ai = ls + (hi & 1) + (hi >> 1);
//      const ai = ls + (hi & 1) + (hi >> 1);

        const as = ai;
//      const as = ai;
        const bs = ai - hi;
//      const bs = ai - hi;

        wdec14Return.a = as;
//      wdec14Return.a = as;
        wdec14Return.b = bs;
//      wdec14Return.b = bs;
    }
//  }

    function wdec16(l, h) {
//  function wdec16(l, h) {
        const m = UInt16(l);
//      const m = UInt16(l);
        const d = UInt16(h);
//      const d = UInt16(h);

        const bb = (m - (d >> 1)) & MOD_MASK;
//      const bb = (m - (d >> 1)) & MOD_MASK;
        const aa = (d + bb - A_OFFSET) & MOD_MASK;
//      const aa = (d + bb - A_OFFSET) & MOD_MASK;

        wdec14Return.a = aa;
//      wdec14Return.a = aa;
        wdec14Return.b = bb;
//      wdec14Return.b = bb;
    }
//  }



    function wav2Decode(buffer, j, nx, ox, ny, oy, mx) {
//  function wav2Decode(buffer, j, nx, ox, ny, oy, mx) {
        const w14 = mx < 1 << 14;
//      const w14 = mx < 1 << 14;
        const n = nx > ny ? ny : nx;
//      const n = nx > ny ? ny : nx;
        let p = 1;
//      let p = 1;
        let p2;
//      let p2;
        let py;
//      let py;

        while (p <= n) p <<= 1;
//      while (p <= n) p <<= 1;

        p >>= 1;
//      p >>= 1;
        p2 = p;
//      p2 = p;
        p >>= 1;
//      p >>= 1;

        while (p >= 1) {
//      while (p >= 1) {
            py = 0;
//          py = 0;
            const ey = py + oy * (ny - p2);
//          const ey = py + oy * (ny - p2);
            const oy1 = oy * p;
//          const oy1 = oy * p;
            const oy2 = oy * p2;
//          const oy2 = oy * p2;
            const ox1 = ox * p;
//          const ox1 = ox * p;
            const ox2 = ox * p2;
//          const ox2 = ox * p2;
            let i00, i01, i10, i11;
//          let i00, i01, i10, i11;

            for (; py <= ey; py += oy2) {
//          for (; py <= ey; py += oy2) {
                let px = py;
//              let px = py;
                const ex = py + ox * (nx - p2);
//              const ex = py + ox * (nx - p2);

                for (; px <= ex; px += ox2) {
//              for (; px <= ex; px += ox2) {
                    const p01 = px + ox1;
//                  const p01 = px + ox1;
                    const p10 = px + oy1;
//                  const p10 = px + oy1;
                    const p11 = p10 + ox1;
//                  const p11 = p10 + ox1;

                    if (w14) {
//                  if (w14) {
                        wdec14(buffer[px + j], buffer[p10 + j]);
//                      wdec14(buffer[px + j], buffer[p10 + j]);

                        i00 = wdec14Return.a;
//                      i00 = wdec14Return.a;
                        i10 = wdec14Return.b;
//                      i10 = wdec14Return.b;

                        wdec14(buffer[p01 + j], buffer[p11 + j]);
//                      wdec14(buffer[p01 + j], buffer[p11 + j]);

                        i01 = wdec14Return.a;
//                      i01 = wdec14Return.a;
                        i11 = wdec14Return.b;
//                      i11 = wdec14Return.b;

                        wdec14(i00, i01);
//                      wdec14(i00, i01);

                        buffer[px + j] = wdec14Return.a;
//                      buffer[px + j] = wdec14Return.a;
                        buffer[p01 + j] = wdec14Return.b;
//                      buffer[p01 + j] = wdec14Return.b;

                        wdec14(i10, i11);
//                      wdec14(i10, i11);

                        buffer[p10 + j] = wdec14Return.a;
//                      buffer[p10 + j] = wdec14Return.a;
                        buffer[p11 + j] = wdec14Return.b;
//                      buffer[p11 + j] = wdec14Return.b;
                    } else {
//                  } else {
                        wdec16(buffer[px + j], buffer[p10 + j]);
//                      wdec16(buffer[px + j], buffer[p10 + j]);

                        i00 = wdec14Return.a;
//                      i00 = wdec14Return.a;
                        i10 = wdec14Return.b;
//                      i10 = wdec14Return.b;

                        wdec16(buffer[p01 + j], buffer[p11 + j]);
//                      wdec16(buffer[p01 + j], buffer[p11 + j]);

                        i01 = wdec14Return.a;
//                      i01 = wdec14Return.a;
                        i11 = wdec14Return.b;
//                      i11 = wdec14Return.b;

                        wdec16(i00, i01);
//                      wdec16(i00, i01);

                        buffer[px + j] = wdec14Return.a;
//                      buffer[px + j] = wdec14Return.a;
                        buffer[p01 + j] = wdec14Return.b;
//                      buffer[p01 + j] = wdec14Return.b;

                        wdec16(i10, i11);
//                      wdec16(i10, i11);

                        buffer[p10 + j] = wdec14Return.a;
//                      buffer[p10 + j] = wdec14Return.a;
                        buffer[p11 + j] = wdec14Return.b;
//                      buffer[p11 + j] = wdec14Return.b;
                    }
//                  }
                }
//              }

                if (nx & p) {
//              if (nx & p) {
                    const p10 = px + oy1;
//                  const p10 = px + oy1;

                    if (w14) wdec14(buffer[px + j], buffer[p10 + j]);
//                  if (w14) wdec14(buffer[px + j], buffer[p10 + j]);
                    else wdec16(buffer[px + j], buffer[p10 + j]);
//                  else wdec16(buffer[px + j], buffer[p10 + j]);

                    i00 = wdec14Return.a;
//                  i00 = wdec14Return.a;
                    buffer[p10 + j] = wdec14Return.b;
//                  buffer[p10 + j] = wdec14Return.b;

                    buffer[px + j] = i00;
//                  buffer[px + j] = i00;
                }
//              }
            }
//          }

            if (ny & p) {
//          if (ny & p) {
                let px = py;
//              let px = py;
                const ex = py + ox * (nx - p2);
//              const ex = py + ox * (nx - p2);

                for (; px <= ex; px += ox2) {
//              for (; px <= ex; px += ox2) {
                    const p01 = px + ox1;
//                  const p01 = px + ox1;

                    if (w14) wdec14(buffer[px + j], buffer[p01 + j]);
//                  if (w14) wdec14(buffer[px + j], buffer[p01 + j]);
                    else wdec16(buffer[px + j], buffer[p01 + j]);
//                  else wdec16(buffer[px + j], buffer[p01 + j]);

                    i00 = wdec14Return.a;
//                  i00 = wdec14Return.a;
                    buffer[p01 + j] = wdec14Return.b;
//                  buffer[p01 + j] = wdec14Return.b;

                    buffer[px + j] = i00;
//                  buffer[px + j] = i00;
                }
//              }
            }
//          }

            p2 = p;
//          p2 = p;
            p >>= 1;
//          p >>= 1;
        }
//      }

        return py;
//      return py;
    }
//  }



    function hufDecode(
//  function hufDecode(
        encodingTable,
//      encodingTable,
        decodingTable,
//      decodingTable,
        uInt8Array,
//      uInt8Array,
        inOffset,
//      inOffset,
        ni,
//      ni,
        rlc,
//      rlc,
        no,
//      no,
        outBuffer,
//      outBuffer,
        outOffset,
//      outOffset,
    ) {
//  ) {
        let c = 0;
//      let c = 0;
        let lc = 0;
//      let lc = 0;
        const outBufferEndOffset = no;
//      const outBufferEndOffset = no;
        const inOffsetEnd = Math.trunc(inOffset.value + (ni + 7) / 8);
//      const inOffsetEnd = Math.trunc(inOffset.value + (ni + 7) / 8);

        while (inOffset.value < inOffsetEnd) {
//      while (inOffset.value < inOffsetEnd) {
            getChar(c, lc, uInt8Array, inOffset);
//          getChar(c, lc, uInt8Array, inOffset);

            c = getCharReturn.c;
//          c = getCharReturn.c;
            lc = getCharReturn.lc;
//          lc = getCharReturn.lc;

            while (lc >= HUF_DECBITS) {
//          while (lc >= HUF_DECBITS) {
                const index = (c >> (lc - HUF_DECBITS)) & HUF_DECMASK;
//              const index = (c >> (lc - HUF_DECBITS)) & HUF_DECMASK;
                const pl = decodingTable[index];
//              const pl = decodingTable[index];

                if (pl.len) {
//              if (pl.len) {
                    lc -= pl.len;
//                  lc -= pl.len;

                    getCode(
//                  getCode(
                        pl.lit,
//                      pl.lit,
                        rlc,
//                      rlc,
                        c,
//                      c,
                        lc,
//                      lc,
                        uInt8Array,
//                      uInt8Array,
                        inOffset,
//                      inOffset,
                        outBuffer,
//                      outBuffer,
                        outOffset,
//                      outOffset,
                        outBufferEndOffset,
//                      outBufferEndOffset,
                    );
//                  );

                    c = getCodeReturn.c;
//                  c = getCodeReturn.c;
                    lc = getCodeReturn.lc;
//                  lc = getCodeReturn.lc;
                } else {
//              } else {
                    if (!pl.p) {
//                  if (!pl.p) {
                        throw new Error("hufDecode issues");
//                      throw new Error("hufDecode issues");
                    }
//                  }

                    let j;
//                  let j;

                    for (j = 0; j < pl.lit; j++) {
//                  for (j = 0; j < pl.lit; j++) {
                        const l = hufLength(encodingTable[pl.p[j]]);
//                      const l = hufLength(encodingTable[pl.p[j]]);

                        while (lc < l && inOffset.value < inOffsetEnd) {
//                      while (lc < l && inOffset.value < inOffsetEnd) {
                            getChar(c, lc, uInt8Array, inOffset);
//                          getChar(c, lc, uInt8Array, inOffset);

                            c = getCharReturn.c;
//                          c = getCharReturn.c;
                            lc = getCharReturn.lc;
//                          lc = getCharReturn.lc;
                        }
//                      }

                        if (lc >= l) {
//                      if (lc >= l) {
                            if (
//                          if (
                                hufCode(encodingTable[pl.p[j]]) ==
//                              hufCode(encodingTable[pl.p[j]]) ==
                                ((c >> (lc - l)) & ((1 << l) - 1))
//                              ((c >> (lc - l)) & ((1 << l) - 1))
                            ) {
//                          ) {
                                lc -= l;
//                              lc -= l;

                                getCode(
//                              getCode(
                                    pl.p[j],
//                                  pl.p[j],
                                    rlc,
//                                  rlc,
                                    c,
//                                  c,
                                    lc,
//                                  lc,
                                    uInt8Array,
//                                  uInt8Array,
                                    inOffset,
//                                  inOffset,
                                    outBuffer,
//                                  outBuffer,
                                    outOffset,
//                                  outOffset,
                                    outBufferEndOffset,
//                                  outBufferEndOffset,
                                );
//                              );

                                c = getCodeReturn.c;
//                              c = getCodeReturn.c;
                                lc = getCodeReturn.lc;
//                              lc = getCodeReturn.lc;

                                break;
//                              break;
                            }
//                          }
                        }
//                      }
                    }
//                  }

                    if (j == pl.lit) {
//                  if (j == pl.lit) {
                        throw new Error("hufDecode issues");
//                      throw new Error("hufDecode issues");
                    }
//                  }
                }
//              }
            }
//          }
        }
//      }

        const i = (8 - ni) & 7;
//      const i = (8 - ni) & 7;

        c >>= i;
//      c >>= i;
        lc -= i;
//      lc -= i;

        while (lc > 0) {
//      while (lc > 0) {
            const pl = decodingTable[(c << (HUF_DECBITS - lc)) & HUF_DECMASK];
//          const pl = decodingTable[(c << (HUF_DECBITS - lc)) & HUF_DECMASK];

            if (pl.len) {
//          if (pl.len) {
                lc -= pl.len;
//              lc -= pl.len;

                getCode(
//              getCode(
                    pl.lit,
//                  pl.lit,
                    rlc,
//                  rlc,
                    c,
//                  c,
                    lc,
//                  lc,
                    uInt8Array,
//                  uInt8Array,
                    inOffset,
//                  inOffset,
                    outBuffer,
//                  outBuffer,
                    outOffset,
//                  outOffset,
                    outBufferEndOffset,
//                  outBufferEndOffset,
                );
//              );

                c = getCodeReturn.c;
//              c = getCodeReturn.c;
                lc = getCodeReturn.lc;
//              lc = getCodeReturn.lc;
            } else {
//          } else {
                throw new Error("hufDecode issues");
//              throw new Error("hufDecode issues");
            }
//          }
        }
//      }

        return true;
//      return true;
    }
//  }



        function hufUncompress(
//      function hufUncompress(
            uInt8Array,
//          uInt8Array,
            inDataView,
//          inDataView,
            inOffset,
//          inOffset,
            nCompressed,
//          nCompressed,
            outBuffer,
//          outBuffer,
            nRaw,
//          nRaw,
        ) {
//      ) {
            const outOffset = { value: 0 };
//          const outOffset = { value: 0 };
            const initialInOffset = inOffset.value;
//          const initialInOffset = inOffset.value;

            const im = parseUint32(inDataView, inOffset);
//          const im = parseUint32(inDataView, inOffset);
            const iM = parseUint32(inDataView, inOffset);
//          const iM = parseUint32(inDataView, inOffset);

            inOffset.value += 4;
//          inOffset.value += 4;

            const nBits = parseUint32(inDataView, inOffset);
//          const nBits = parseUint32(inDataView, inOffset);

            inOffset.value += 4;
//          inOffset.value += 4;

            if (im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE) {
//          if (im < 0 || im >= HUF_ENCSIZE || iM < 0 || iM >= HUF_ENCSIZE) {
                throw new Error("Something wrong with HUF_ENCSIZE");
//              throw new Error("Something wrong with HUF_ENCSIZE");
            }
//          }

            const freq = new Array(HUF_ENCSIZE);
//          const freq = new Array(HUF_ENCSIZE);
            const hdec = new Array(HUF_DECSIZE);
//          const hdec = new Array(HUF_DECSIZE);

            hufClearDecTable(hdec);
//          hufClearDecTable(hdec);

            const ni = nCompressed - (inOffset.value - initialInOffset);
//          const ni = nCompressed - (inOffset.value - initialInOffset);

            hufUnpackEncTable(uInt8Array, inOffset, ni, im, iM, freq);
//          hufUnpackEncTable(uInt8Array, inOffset, ni, im, iM, freq);

            if (nBits > 8 * (nCompressed - (inOffset.value - initialInOffset))) {
//          if (nBits > 8 * (nCompressed - (inOffset.value - initialInOffset))) {
                throw new Error("Something wrong with hufUncompress");
//              throw new Error("Something wrong with hufUncompress");
            }
//          }

            hufBuildDecTable(freq, im, iM, hdec);
//          hufBuildDecTable(freq, im, iM, hdec);

            hufDecode(
//          hufDecode(
                freq,
//              freq,
                hdec,
//              hdec,
                uInt8Array,
//              uInt8Array,
                inOffset,
//              inOffset,
                nBits,
//              nBits,
                iM,
//              iM,
                nRaw,
//              nRaw,
                outBuffer,
//              outBuffer,
                outOffset,
//              outOffset,
            );
//          );
        }
//      }



        function applyLut(lut, data, nData) {
//      function applyLut(lut, data, nData) {
            for (let i = 0; i < nData; ++i) {
//          for (let i = 0; i < nData; ++i) {
                data[i] = lut[data[i]];
//              data[i] = lut[data[i]];
            }
//          }
        }
//      }



        function predictor(source) {
//      function predictor(source) {
            for (let t = 1; t < source.length; t++) {
//          for (let t = 1; t < source.length; t++) {
                const d = source[t - 1] + source[t] - 128;
//              const d = source[t - 1] + source[t] - 128;
                source[t] = d;
//              source[t] = d;
            }
//          }
        }
//      }



        function interleaveScalar(source, out) {
//      function interleaveScalar(source, out) {
            let t1 = 0;
//          let t1 = 0;
            let t2 = Math.floor((source.length + 1) / 2);
//          let t2 = Math.floor((source.length + 1) / 2);
            let s = 0;
//          let s = 0;
            const stop = source.length - 1;
//          const stop = source.length - 1;

            while (true) {
//          while (true) {
                if (s > stop) break;
//              if (s > stop) break;
                out[s++] = source[t1++];
//              out[s++] = source[t1++];

                if (s > stop) break;
//              if (s > stop) break;
                out[s++] = source[t2++];
//              out[s++] = source[t2++];
            }
//          }
        }
//      }



        function decodeRunLength(source) {
//      function decodeRunLength(source) {
            let size = source.byteLength;
//          let size = source.byteLength;
            const out = new Array();
//          const out = new Array();
            let p = 0;
//          let p = 0;

            const reader = new DataView(source);
//          const reader = new DataView(source);

            while (size > 0) {
//          while (size > 0) {
                const l = reader.getInt8(p++);
//              const l = reader.getInt8(p++);

                if (l < 0) {
//              if (l < 0) {
                    const count = -l;
//                  const count = -l;
                    size -= count + 1;
//                  size -= count + 1;

                    for (let i = 0; i < count; i++) {
//                  for (let i = 0; i < count; i++) {
                        out.push(reader.getUint8(p++));
//                      out.push(reader.getUint8(p++));
                    }
//                  }
                } else {
//              } else {
                    const count = l;
//                  const count = l;
                    size -= 2;
//                  size -= 2;

                    const value = reader.getUint8(p++);
//                  const value = reader.getUint8(p++);

                    for (let i = 0; i < count + 1; i++) {
//                  for (let i = 0; i < count + 1; i++) {
                        out.push(value);
//                      out.push(value);
                    }
//                  }
                }
//              }
            }
//          }

            return out;
//          return out;
        }
//      }



    function lossyDctDecode(
//  function lossyDctDecode(
        cscSet,
//      cscSet,
        rowPtrs,
//      rowPtrs,
        channelData,
//      channelData,
        acBuffer,
//      acBuffer,
        dcBuffer,
//      dcBuffer,
        outBuffer,
//      outBuffer,
    ) {
//  ) {
        let dataView = new DataView(outBuffer.buffer);
//      let dataView = new DataView(outBuffer.buffer);

        const width = channelData[cscSet.idx[0]].width;
//      const width = channelData[cscSet.idx[0]].width;
        const height = channelData[cscSet.idx[0]].height;
//      const height = channelData[cscSet.idx[0]].height;

        const numComp = 3;
//      const numComp = 3;

        const numFullBlocksX = Math.floor(width / 8.0);
//      const numFullBlocksX = Math.floor(width / 8.0);
        const numBlocksX = Math.ceil(width / 8.0);
//      const numBlocksX = Math.ceil(width / 8.0);
        const numBlocksY = Math.ceil(height / 8.0);
//      const numBlocksY = Math.ceil(height / 8.0);
        const leftoverX = width - (numBlocksX - 1) * 8;
//      const leftoverX = width - (numBlocksX - 1) * 8;
        const leftoverY = height - (numBlocksY - 1) * 8;
//      const leftoverY = height - (numBlocksY - 1) * 8;

        const currAcComp = { value: 0 };
//      const currAcComp = { value: 0 };
        const currDcComp = new Array(numComp);
//      const currDcComp = new Array(numComp);
        const dctData = new Array(numComp);
//      const dctData = new Array(numComp);
        const halfZigBlock = new Array(numComp);
//      const halfZigBlock = new Array(numComp);
        const rowBlock = new Array(numComp);
//      const rowBlock = new Array(numComp);
        const rowOffsets = new Array(numComp);
//      const rowOffsets = new Array(numComp);

        for (let comp = 0; comp < numComp; ++comp) {
//      for (let comp = 0; comp < numComp; ++comp) {
            rowOffsets[comp] = rowPtrs[cscSet.idx[comp]];
//          rowOffsets[comp] = rowPtrs[cscSet.idx[comp]];
            currDcComp[comp] =
//          currDcComp[comp] =
                comp < 1 ? 0 : currDcComp[comp - 1] + numBlocksX * numBlocksY;
//              comp < 1 ? 0 : currDcComp[comp - 1] + numBlocksX * numBlocksY;
            dctData[comp] = new Float32Array(64);
//          dctData[comp] = new Float32Array(64);
            halfZigBlock[comp] = new Uint16Array(64);
//          halfZigBlock[comp] = new Uint16Array(64);
            rowBlock[comp] = new Uint16Array(numBlocksX * 64);
//          rowBlock[comp] = new Uint16Array(numBlocksX * 64);
        }
//      }

        for (let blocky = 0; blocky < numBlocksY; ++blocky) {
//      for (let blocky = 0; blocky < numBlocksY; ++blocky) {
            let maxY = 8;
//          let maxY = 8;

            if (blocky == numBlocksY - 1) maxY = leftoverY;
//          if (blocky == numBlocksY - 1) maxY = leftoverY;

            let maxX = 8;
//          let maxX = 8;

            for (let blockx = 0; blockx < numBlocksX; ++blockx) {
//          for (let blockx = 0; blockx < numBlocksX; ++blockx) {
                if (blockx == numBlocksX - 1) maxX = leftoverX;
//              if (blockx == numBlocksX - 1) maxX = leftoverX;

                for (let comp = 0; comp < numComp; ++comp) {
//              for (let comp = 0; comp < numComp; ++comp) {
                    halfZigBlock[comp].fill(0);
//                  halfZigBlock[comp].fill(0);

                    // set block DC component
                    // set block DC component
                    halfZigBlock[comp][0] = dcBuffer[currDcComp[comp]++];
//                  halfZigBlock[comp][0] = dcBuffer[currDcComp[comp]++];
                    // set block AC components
                    // set block AC components
                    unRleAC(currAcComp, acBuffer, halfZigBlock[comp]);
//                  unRleAC(currAcComp, acBuffer, halfZigBlock[comp]);

                    // UnZigZag block to float
                    // UnZigZag block to float
                    unZigZag(halfZigBlock[comp], dctData[comp]);
//                  unZigZag(halfZigBlock[comp], dctData[comp]);
                    // decode float dct
                    // decode float dct
                    dctInverse(dctData[comp]);
//                  dctInverse(dctData[comp]);
                }
//              }

                if (numComp == 3) {
//              if (numComp == 3) {
                    csc709Inverse(dctData);
//                  csc709Inverse(dctData);
                }
//              }

                for (let comp = 0; comp < numComp; ++comp) {
//              for (let comp = 0; comp < numComp; ++comp) {
                    convertToHalf(dctData[comp], rowBlock[comp], blockx * 64);
//                  convertToHalf(dctData[comp], rowBlock[comp], blockx * 64);
                }
//              }
            } // blockx
//          } // blockx

            let offset = 0;
//          let offset = 0;

            for (let comp = 0; comp < numComp; ++comp) {
//          for (let comp = 0; comp < numComp; ++comp) {
                const type = channelData[cscSet.idx[comp]].type;
//              const type = channelData[cscSet.idx[comp]].type;

                for (let y = 8 * blocky; y < 8 * blocky + maxY; ++y) {
//              for (let y = 8 * blocky; y < 8 * blocky + maxY; ++y) {
                    offset = rowOffsets[comp][y];
//                  offset = rowOffsets[comp][y];

                    for (let blockx = 0; blockx < numFullBlocksX; ++blockx) {
//                  for (let blockx = 0; blockx < numFullBlocksX; ++blockx) {
                        const src = blockx * 64 + (y & 0x7) * 8;
//                      const src = blockx * 64 + (y & 0x7) * 8;

                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 0 * INT16_SIZE * type,
//                          offset + 0 * INT16_SIZE * type,
                            rowBlock[comp][src + 0],
//                          rowBlock[comp][src + 0],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 1 * INT16_SIZE * type,
//                          offset + 1 * INT16_SIZE * type,
                            rowBlock[comp][src + 1],
//                          rowBlock[comp][src + 1],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 2 * INT16_SIZE * type,
//                          offset + 2 * INT16_SIZE * type,
                            rowBlock[comp][src + 2],
//                          rowBlock[comp][src + 2],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 3 * INT16_SIZE * type,
//                          offset + 3 * INT16_SIZE * type,
                            rowBlock[comp][src + 3],
//                          rowBlock[comp][src + 3],
                            true,
//                          true,
                        );
//                      );

                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 4 * INT16_SIZE * type,
//                          offset + 4 * INT16_SIZE * type,
                            rowBlock[comp][src + 4],
//                          rowBlock[comp][src + 4],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 5 * INT16_SIZE * type,
//                          offset + 5 * INT16_SIZE * type,
                            rowBlock[comp][src + 5],
//                          rowBlock[comp][src + 5],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 6 * INT16_SIZE * type,
//                          offset + 6 * INT16_SIZE * type,
                            rowBlock[comp][src + 6],
//                          rowBlock[comp][src + 6],
                            true,
//                          true,
                        );
//                      );
                        dataView.setUint16(
//                      dataView.setUint16(
                            offset + 7 * INT16_SIZE * type,
//                          offset + 7 * INT16_SIZE * type,
                            rowBlock[comp][src + 7],
//                          rowBlock[comp][src + 7],
                            true,
//                          true,
                        );
//                      );

                        offset += 8 * INT16_SIZE * type;
//                      offset += 8 * INT16_SIZE * type;
                    }
//                  }
                }
//              }

                // handle partial X blocks
                // handle partial X blocks
                if (numFullBlocksX != numBlocksX) {
//              if (numFullBlocksX != numBlocksX) {
                    for (let y = 8 * blocky; y < 8 * blocky + maxY; ++y) {
//                  for (let y = 8 * blocky; y < 8 * blocky + maxY; ++y) {
                        const offset =
//                      const offset =
                            rowOffsets[comp][y] + 8 * numFullBlocksX * INT16_SIZE * type;
//                          rowOffsets[comp][y] + 8 * numFullBlocksX * INT16_SIZE * type;
                        const src = numFullBlocksX * 64 + (y & 0x7) * 8;
//                      const src = numFullBlocksX * 64 + (y & 0x7) * 8;

                        for (let x = 0; x < maxX; ++x) {
//                      for (let x = 0; x < maxX; ++x) {
                            dataView.setUint16(
//                          dataView.setUint16(
                                offset + x * INT16_SIZE * type,
//                              offset + x * INT16_SIZE * type,
                                rowBlock[comp][src + x],
//                              rowBlock[comp][src + x],
                                true,
//                              true,
                            );
//                          );
                        }
//                      }
                    }
//                  }
                }
//              }
            } // comp
//          } // comp
        } // blocky
//      } // blocky

        const halfRow = new Uint16Array(width);
//      const halfRow = new Uint16Array(width);
        dataView = new DataView(outBuffer.buffer);
//      dataView = new DataView(outBuffer.buffer);

        // convert channels back to float, if needed
        // convert channels back to float, if needed
        for (let comp = 0; comp < numComp; ++comp) {
//      for (let comp = 0; comp < numComp; ++comp) {
            channelData[cscSet.idx[comp]].decoded = true;
//          channelData[cscSet.idx[comp]].decoded = true;
            const type = channelData[cscSet.idx[comp]].type;
//          const type = channelData[cscSet.idx[comp]].type;

            if (channelData[comp].type != 2) continue;
//          if (channelData[comp].type != 2) continue;

            for (let y = 0; y < height; ++y) {
//          for (let y = 0; y < height; ++y) {
                const offset = rowOffsets[comp][y];
//              const offset = rowOffsets[comp][y];

                for (let x = 0; x < width; ++x) {
//              for (let x = 0; x < width; ++x) {
                    halfRow[x] = dataView.getUint16(offset + x * INT16_SIZE * type, true);
//                  halfRow[x] = dataView.getUint16(offset + x * INT16_SIZE * type, true);
                }
//              }

                for (let x = 0; x < width; ++x) {
//              for (let x = 0; x < width; ++x) {
                    dataView.setFloat32(
//                  dataView.setFloat32(
                        offset + x * INT16_SIZE * type,
//                      offset + x * INT16_SIZE * type,
                        decodeFloat16(halfRow[x]),
//                      decodeFloat16(halfRow[x]),
                        true,
//                      true,
                    );
//                  );
                }
//              }
            }
//          }
        }
//      }
    }
//  }



    function unRleAC(currAcComp, acBuffer, halfZigBlock) {
//  function unRleAC(currAcComp, acBuffer, halfZigBlock) {
        let acValue;
//      let acValue;
        let dctComp = 1;
//      let dctComp = 1;

        while (dctComp < 64) {
//      while (dctComp < 64) {
            acValue = acBuffer[currAcComp.value];
//          acValue = acBuffer[currAcComp.value];

            if (acValue == 0xff00) {
//          if (acValue == 0xff00) {
                dctComp = 64;
//              dctComp = 64;
            } else if (acValue >> 8 == 0xff) {
//          } else if (acValue >> 8 == 0xff) {
                dctComp += acValue & 0xff;
//              dctComp += acValue & 0xff;
            } else {
//          } else {
                halfZigBlock[dctComp] = acValue;
//              halfZigBlock[dctComp] = acValue;
                dctComp++;
//              dctComp++;
            }
//          }

            currAcComp.value++;
//          currAcComp.value++;
        }
//      }
    }
//  }



    function unZigZag(src, dst) {
//  function unZigZag(src, dst) {
        dst[0] = decodeFloat16(src[0]);
//      dst[0] = decodeFloat16(src[0]);
        dst[1] = decodeFloat16(src[1]);
//      dst[1] = decodeFloat16(src[1]);
        dst[2] = decodeFloat16(src[5]);
//      dst[2] = decodeFloat16(src[5]);
        dst[3] = decodeFloat16(src[6]);
//      dst[3] = decodeFloat16(src[6]);
        dst[4] = decodeFloat16(src[14]);
//      dst[4] = decodeFloat16(src[14]);
        dst[5] = decodeFloat16(src[15]);
//      dst[5] = decodeFloat16(src[15]);
        dst[6] = decodeFloat16(src[27]);
//      dst[6] = decodeFloat16(src[27]);
        dst[7] = decodeFloat16(src[28]);
//      dst[7] = decodeFloat16(src[28]);
        dst[8] = decodeFloat16(src[2]);
//      dst[8] = decodeFloat16(src[2]);
        dst[9] = decodeFloat16(src[4]);
//      dst[9] = decodeFloat16(src[4]);

        dst[10] = decodeFloat16(src[7]);
//      dst[10] = decodeFloat16(src[7]);
        dst[11] = decodeFloat16(src[13]);
//      dst[11] = decodeFloat16(src[13]);
        dst[12] = decodeFloat16(src[16]);
//      dst[12] = decodeFloat16(src[16]);
        dst[13] = decodeFloat16(src[26]);
//      dst[13] = decodeFloat16(src[26]);
        dst[14] = decodeFloat16(src[29]);
//      dst[14] = decodeFloat16(src[29]);
        dst[15] = decodeFloat16(src[42]);
//      dst[15] = decodeFloat16(src[42]);
        dst[16] = decodeFloat16(src[3]);
//      dst[16] = decodeFloat16(src[3]);
        dst[17] = decodeFloat16(src[8]);
//      dst[17] = decodeFloat16(src[8]);
        dst[18] = decodeFloat16(src[12]);
//      dst[18] = decodeFloat16(src[12]);
        dst[19] = decodeFloat16(src[17]);
//      dst[19] = decodeFloat16(src[17]);

        dst[20] = decodeFloat16(src[25]);
//      dst[20] = decodeFloat16(src[25]);
        dst[21] = decodeFloat16(src[30]);
//      dst[21] = decodeFloat16(src[30]);
        dst[22] = decodeFloat16(src[41]);
//      dst[22] = decodeFloat16(src[41]);
        dst[23] = decodeFloat16(src[43]);
//      dst[23] = decodeFloat16(src[43]);
        dst[24] = decodeFloat16(src[9]);
//      dst[24] = decodeFloat16(src[9]);
        dst[25] = decodeFloat16(src[11]);
//      dst[25] = decodeFloat16(src[11]);
        dst[26] = decodeFloat16(src[18]);
//      dst[26] = decodeFloat16(src[18]);
        dst[27] = decodeFloat16(src[24]);
//      dst[27] = decodeFloat16(src[24]);
        dst[28] = decodeFloat16(src[31]);
//      dst[28] = decodeFloat16(src[31]);
        dst[29] = decodeFloat16(src[40]);
//      dst[29] = decodeFloat16(src[40]);

        dst[30] = decodeFloat16(src[44]);
//      dst[30] = decodeFloat16(src[44]);
        dst[31] = decodeFloat16(src[53]);
//      dst[31] = decodeFloat16(src[53]);
        dst[32] = decodeFloat16(src[10]);
//      dst[32] = decodeFloat16(src[10]);
        dst[33] = decodeFloat16(src[19]);
//      dst[33] = decodeFloat16(src[19]);
        dst[34] = decodeFloat16(src[23]);
//      dst[34] = decodeFloat16(src[23]);
        dst[35] = decodeFloat16(src[32]);
//      dst[35] = decodeFloat16(src[32]);
        dst[36] = decodeFloat16(src[39]);
//      dst[36] = decodeFloat16(src[39]);
        dst[37] = decodeFloat16(src[45]);
//      dst[37] = decodeFloat16(src[45]);
        dst[38] = decodeFloat16(src[52]);
//      dst[38] = decodeFloat16(src[52]);
        dst[39] = decodeFloat16(src[54]);
//      dst[39] = decodeFloat16(src[54]);

        dst[40] = decodeFloat16(src[20]);
//      dst[40] = decodeFloat16(src[20]);
        dst[41] = decodeFloat16(src[22]);
//      dst[41] = decodeFloat16(src[22]);
        dst[42] = decodeFloat16(src[33]);
//      dst[42] = decodeFloat16(src[33]);
        dst[43] = decodeFloat16(src[38]);
//      dst[43] = decodeFloat16(src[38]);
        dst[44] = decodeFloat16(src[46]);
//      dst[44] = decodeFloat16(src[46]);
        dst[45] = decodeFloat16(src[51]);
//      dst[45] = decodeFloat16(src[51]);
        dst[46] = decodeFloat16(src[55]);
//      dst[46] = decodeFloat16(src[55]);
        dst[47] = decodeFloat16(src[60]);
//      dst[47] = decodeFloat16(src[60]);
        dst[48] = decodeFloat16(src[21]);
//      dst[48] = decodeFloat16(src[21]);
        dst[49] = decodeFloat16(src[34]);
//      dst[49] = decodeFloat16(src[34]);

        dst[50] = decodeFloat16(src[37]);
//      dst[50] = decodeFloat16(src[37]);
        dst[51] = decodeFloat16(src[47]);
//      dst[51] = decodeFloat16(src[47]);
        dst[52] = decodeFloat16(src[50]);
//      dst[52] = decodeFloat16(src[50]);
        dst[53] = decodeFloat16(src[56]);
//      dst[53] = decodeFloat16(src[56]);
        dst[54] = decodeFloat16(src[59]);
//      dst[54] = decodeFloat16(src[59]);
        dst[55] = decodeFloat16(src[61]);
//      dst[55] = decodeFloat16(src[61]);
        dst[56] = decodeFloat16(src[35]);
//      dst[56] = decodeFloat16(src[35]);
        dst[57] = decodeFloat16(src[36]);
//      dst[57] = decodeFloat16(src[36]);
        dst[58] = decodeFloat16(src[48]);
//      dst[58] = decodeFloat16(src[48]);
        dst[59] = decodeFloat16(src[49]);
//      dst[59] = decodeFloat16(src[49]);

        dst[60] = decodeFloat16(src[57]);
//      dst[60] = decodeFloat16(src[57]);
        dst[61] = decodeFloat16(src[58]);
//      dst[61] = decodeFloat16(src[58]);
        dst[62] = decodeFloat16(src[62]);
//      dst[62] = decodeFloat16(src[62]);
        dst[63] = decodeFloat16(src[63]);
//      dst[63] = decodeFloat16(src[63]);
    }
//  }



    function dctInverse(data) {
//  function dctInverse(data) {
        const a = 0.5 * Math.cos(3.14159 / 4.0);
//      const a = 0.5 * Math.cos(3.14159 / 4.0);
        const b = 0.5 * Math.cos(3.14159 / 16.0);
//      const b = 0.5 * Math.cos(3.14159 / 16.0);
        const c = 0.5 * Math.cos(3.14159 / 8.0);
//      const c = 0.5 * Math.cos(3.14159 / 8.0);
        const d = 0.5 * Math.cos((3.0 * 3.14159) / 16.0);
//      const d = 0.5 * Math.cos((3.0 * 3.14159) / 16.0);
        const e = 0.5 * Math.cos((5.0 * 3.14159) / 16.0);
//      const e = 0.5 * Math.cos((5.0 * 3.14159) / 16.0);
        const f = 0.5 * Math.cos((3.0 * 3.14159) / 8.0);
//      const f = 0.5 * Math.cos((3.0 * 3.14159) / 8.0);
        const g = 0.5 * Math.cos((7.0 * 3.14159) / 16.0);
//      const g = 0.5 * Math.cos((7.0 * 3.14159) / 16.0);

        const alpha = new Array(4);
//      const alpha = new Array(4);
        const beta = new Array(4);
//      const beta = new Array(4);
        const theta = new Array(4);
//      const theta = new Array(4);
        const gamma = new Array(4);
//      const gamma = new Array(4);

        for (let row = 0; row < 8; ++row) {
//      for (let row = 0; row < 8; ++row) {
            const rowPtr = row * 8;
//          const rowPtr = row * 8;

            alpha[0] = c * data[rowPtr + 2];
//          alpha[0] = c * data[rowPtr + 2];
            alpha[1] = f * data[rowPtr + 2];
//          alpha[1] = f * data[rowPtr + 2];
            alpha[2] = c * data[rowPtr + 6];
//          alpha[2] = c * data[rowPtr + 6];
            alpha[3] = f * data[rowPtr + 6];
//          alpha[3] = f * data[rowPtr + 6];

            beta[0] =
//          beta[0] =
                b * data[rowPtr + 1] +
//              b * data[rowPtr + 1] +
                d * data[rowPtr + 3] +
//              d * data[rowPtr + 3] +
                e * data[rowPtr + 5] +
//              e * data[rowPtr + 5] +
                g * data[rowPtr + 7];
//              g * data[rowPtr + 7];
            beta[1] =
//          beta[1] =
                d * data[rowPtr + 1] -
//              d * data[rowPtr + 1] -
                g * data[rowPtr + 3] -
//              g * data[rowPtr + 3] -
                b * data[rowPtr + 5] -
//              b * data[rowPtr + 5] -
                e * data[rowPtr + 7];
//              e * data[rowPtr + 7];
            beta[2] =
//          beta[2] =
                e * data[rowPtr + 1] -
//              e * data[rowPtr + 1] -
                b * data[rowPtr + 3] +
//              b * data[rowPtr + 3] +
                g * data[rowPtr + 5] +
//              g * data[rowPtr + 5] +
                d * data[rowPtr + 7];
//              d * data[rowPtr + 7];
            beta[3] =
//          beta[3] =
                g * data[rowPtr + 1] -
//              g * data[rowPtr + 1] -
                e * data[rowPtr + 3] +
//              e * data[rowPtr + 3] +
                d * data[rowPtr + 5] -
//              d * data[rowPtr + 5] -
                b * data[rowPtr + 7];
//              b * data[rowPtr + 7];

            theta[0] = a * (data[rowPtr + 0] + data[rowPtr + 4]);
//          theta[0] = a * (data[rowPtr + 0] + data[rowPtr + 4]);
            theta[3] = a * (data[rowPtr + 0] - data[rowPtr + 4]);
//          theta[3] = a * (data[rowPtr + 0] - data[rowPtr + 4]);
            theta[1] = alpha[0] + alpha[3];
//          theta[1] = alpha[0] + alpha[3];
            theta[2] = alpha[1] - alpha[2];
//          theta[2] = alpha[1] - alpha[2];

            gamma[0] = theta[0] + theta[1];
//          gamma[0] = theta[0] + theta[1];
            gamma[1] = theta[3] + theta[2];
//          gamma[1] = theta[3] + theta[2];
            gamma[2] = theta[3] - theta[2];
//          gamma[2] = theta[3] - theta[2];
            gamma[3] = theta[0] - theta[1];
//          gamma[3] = theta[0] - theta[1];

            data[rowPtr + 0] = gamma[0] + beta[0];
//          data[rowPtr + 0] = gamma[0] + beta[0];
            data[rowPtr + 1] = gamma[1] + beta[1];
//          data[rowPtr + 1] = gamma[1] + beta[1];
            data[rowPtr + 2] = gamma[2] + beta[2];
//          data[rowPtr + 2] = gamma[2] + beta[2];
            data[rowPtr + 3] = gamma[3] + beta[3];
//          data[rowPtr + 3] = gamma[3] + beta[3];

            data[rowPtr + 4] = gamma[3] - beta[3];
//          data[rowPtr + 4] = gamma[3] - beta[3];
            data[rowPtr + 5] = gamma[2] - beta[2];
//          data[rowPtr + 5] = gamma[2] - beta[2];
            data[rowPtr + 6] = gamma[1] - beta[1];
//          data[rowPtr + 6] = gamma[1] - beta[1];
            data[rowPtr + 7] = gamma[0] - beta[0];
//          data[rowPtr + 7] = gamma[0] - beta[0];
        }
//      }

        for (let column = 0; column < 8; ++column) {
//      for (let column = 0; column < 8; ++column) {
            alpha[0] = c * data[16 + column];
//          alpha[0] = c * data[16 + column];
            alpha[1] = f * data[16 + column];
//          alpha[1] = f * data[16 + column];
            alpha[2] = c * data[48 + column];
//          alpha[2] = c * data[48 + column];
            alpha[3] = f * data[48 + column];
//          alpha[3] = f * data[48 + column];

            beta[0] =
//          beta[0] =
                b * data[8 + column] +
//              b * data[8 + column] +
                d * data[24 + column] +
//              d * data[24 + column] +
                e * data[40 + column] +
//              e * data[40 + column] +
                g * data[56 + column];
//              g * data[56 + column];
            beta[1] =
//          beta[1] =
                d * data[8 + column] -
//              d * data[8 + column] -
                g * data[24 + column] -
//              g * data[24 + column] -
                b * data[40 + column] -
//              b * data[40 + column] -
                e * data[56 + column];
//              e * data[56 + column];
            beta[2] =
//          beta[2] =
                e * data[8 + column] -
//              e * data[8 + column] -
                b * data[24 + column] +
//              b * data[24 + column] +
                g * data[40 + column] +
//              g * data[40 + column] +
                d * data[56 + column];
//              d * data[56 + column];
            beta[3] =
//          beta[3] =
                g * data[8 + column] -
//              g * data[8 + column] -
                e * data[24 + column] +
//              e * data[24 + column] +
                d * data[40 + column] -
//              d * data[40 + column] -
                b * data[56 + column];
//              b * data[56 + column];

            theta[0] = a * (data[column] + data[32 + column]);
//          theta[0] = a * (data[column] + data[32 + column]);
            theta[3] = a * (data[column] - data[32 + column]);
//          theta[3] = a * (data[column] - data[32 + column]);

            theta[1] = alpha[0] + alpha[3];
//          theta[1] = alpha[0] + alpha[3];
            theta[2] = alpha[1] - alpha[2];
//          theta[2] = alpha[1] - alpha[2];

            gamma[0] = theta[0] + theta[1];
//          gamma[0] = theta[0] + theta[1];
            gamma[1] = theta[3] + theta[2];
//          gamma[1] = theta[3] + theta[2];
            gamma[2] = theta[3] - theta[2];
//          gamma[2] = theta[3] - theta[2];
            gamma[3] = theta[0] - theta[1];
//          gamma[3] = theta[0] - theta[1];

            data[0 + column] = gamma[0] + beta[0];
//          data[0 + column] = gamma[0] + beta[0];
            data[8 + column] = gamma[1] + beta[1];
//          data[8 + column] = gamma[1] + beta[1];
            data[16 + column] = gamma[2] + beta[2];
//          data[16 + column] = gamma[2] + beta[2];
            data[24 + column] = gamma[3] + beta[3];
//          data[24 + column] = gamma[3] + beta[3];

            data[32 + column] = gamma[3] - beta[3];
//          data[32 + column] = gamma[3] - beta[3];
            data[40 + column] = gamma[2] - beta[2];
//          data[40 + column] = gamma[2] - beta[2];
            data[48 + column] = gamma[1] - beta[1];
//          data[48 + column] = gamma[1] - beta[1];
            data[56 + column] = gamma[0] - beta[0];
//          data[56 + column] = gamma[0] - beta[0];
        }
//      }
    }
//  }



    function csc709Inverse(data) {
//  function csc709Inverse(data) {
        for (let i = 0; i < 64; ++i) {
//      for (let i = 0; i < 64; ++i) {
            const y = data[0][i];
//          const y = data[0][i];
            const cb = data[1][i];
//          const cb = data[1][i];
            const cr = data[2][i];
//          const cr = data[2][i];

            data[0][i] = y + 1.5747 * cr;
//          data[0][i] = y + 1.5747 * cr;
            data[1][i] = y - 0.1873 * cb - 0.4682 * cr;
//          data[1][i] = y - 0.1873 * cb - 0.4682 * cr;
            data[2][i] = y + 1.8556 * cb;
//          data[2][i] = y + 1.8556 * cb;
        }
//      }
    }
//  }



    function convertToHalf(src, dst, idx) {
//  function convertToHalf(src, dst, idx) {
        for (let i = 0; i < 64; ++i) {
//      for (let i = 0; i < 64; ++i) {
            dst[idx + i] = DataUtils.toHalfFloat(toLinear(src[i]));
//          dst[idx + i] = DataUtils.toHalfFloat(toLinear(src[i]));
        }
//      }
    }
//  }



    function toLinear(float) {
//  function toLinear(float) {
        if (float <= 1) {
//      if (float <= 1) {
            return Math.sign(float) * Math.pow(Math.abs(float), 2.2);
//          return Math.sign(float) * Math.pow(Math.abs(float), 2.2);
        } else {
//      } else {
            return Math.sign(float) * Math.pow(logBase, Math.abs(float) - 1.0);
//          return Math.sign(float) * Math.pow(logBase, Math.abs(float) - 1.0);
        }
//      }
    }
//  }



    function uncompressRAW(info) {
//  function uncompressRAW(info) {
        return new DataView(info.array.buffer, info.offset.value, info.size);
//      return new DataView(info.array.buffer, info.offset.value, info.size);
    }
//  }



    function uncompressRLE(info) {
//  function uncompressRLE(info) {
        const compressed = info.viewer.buffer.slice(
//      const compressed = info.viewer.buffer.slice(
            info.offset.value,
//          info.offset.value,
            info.offset.value + info.size,
//          info.offset.value + info.size,
        );
//      );

        const rawBuffer = new Uint8Array(decodeRunLength(compressed));
//      const rawBuffer = new Uint8Array(decodeRunLength(compressed));
        const tmpBuffer = new Uint8Array(rawBuffer.length);
//      const tmpBuffer = new Uint8Array(rawBuffer.length);

        predictor(rawBuffer); // revert predictor
//      predictor(rawBuffer); // revert predictor

        interleaveScalar(rawBuffer, tmpBuffer); // interleave pixels
//      interleaveScalar(rawBuffer, tmpBuffer); // interleave pixels

        return new DataView(tmpBuffer.buffer);
//      return new DataView(tmpBuffer.buffer);
    }
//  }



    function uncompressZIP(info) {
//  function uncompressZIP(info) {
        const compressed = info.array.slice(
//      const compressed = info.array.slice(
            info.offset.value,
//          info.offset.value,
            info.offset.value + info.size,
//          info.offset.value + info.size,
        );
//      );

        const rawBuffer = fflate.unzlibSync(compressed);
//      const rawBuffer = fflate.unzlibSync(compressed);
        const tmpBuffer = new Uint8Array(rawBuffer.length);
//      const tmpBuffer = new Uint8Array(rawBuffer.length);

        predictor(rawBuffer); // revert predictor
//      predictor(rawBuffer); // revert predictor

        interleaveScalar(rawBuffer, tmpBuffer); // interleave pixels
//      interleaveScalar(rawBuffer, tmpBuffer); // interleave pixels

        return new DataView(tmpBuffer.buffer);
//      return new DataView(tmpBuffer.buffer);
    }
//  }



    function uncompressPIZ(info) {
//  function uncompressPIZ(info) {
        const inDataView = info.viewer;
//      const inDataView = info.viewer;
        const inOffset = { value: info.offset.value };
//      const inOffset = { value: info.offset.value };

        const outBuffer = new Uint16Array(
//      const outBuffer = new Uint16Array(
            info.columns * info.lines * (info.inputChannels.length * info.type),
//          info.columns * info.lines * (info.inputChannels.length * info.type),
        );
//      );
        const bitmap = new Uint8Array(BITMAP_SIZE);
//      const bitmap = new Uint8Array(BITMAP_SIZE);

        // Setup channel info
        // Setup channel info
        let outBufferEnd = 0;
//      let outBufferEnd = 0;
        const pizChannelData = new Array(info.inputChannels.length);
//      const pizChannelData = new Array(info.inputChannels.length);
        for (let i = 0, il = info.inputChannels.length; i < il; i++) {
//      for (let i = 0, il = info.inputChannels.length; i < il; i++) {
            pizChannelData[i] = {};
//          pizChannelData[i] = {};
            pizChannelData[i]["start"] = outBufferEnd;
//          pizChannelData[i]["start"] = outBufferEnd;
            pizChannelData[i]["end"] = pizChannelData[i]["start"];
//          pizChannelData[i]["end"] = pizChannelData[i]["start"];
            pizChannelData[i]["nx"] = info.columns;
//          pizChannelData[i]["nx"] = info.columns;
            pizChannelData[i]["ny"] = info.lines;
//          pizChannelData[i]["ny"] = info.lines;
            pizChannelData[i]["size"] = info.type;
//          pizChannelData[i]["size"] = info.type;

            outBufferEnd +=
//          outBufferEnd +=
                pizChannelData[i].nx * pizChannelData[i].ny * pizChannelData[i].size;
//              pizChannelData[i].nx * pizChannelData[i].ny * pizChannelData[i].size;
        }
//      }

        // Read range compression data
        // Read range compression data

        const minNonZero = parseUint16(inDataView, inOffset);
//      const minNonZero = parseUint16(inDataView, inOffset);
        const maxNonZero = parseUint16(inDataView, inOffset);
//      const maxNonZero = parseUint16(inDataView, inOffset);

        if (maxNonZero >= BITMAP_SIZE) {
//      if (maxNonZero >= BITMAP_SIZE) {
            throw new Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");
//          throw new Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");
        }
//      }

        if (minNonZero <= maxNonZero) {
//      if (minNonZero <= maxNonZero) {
            for (let i = 0; i < maxNonZero - minNonZero + 1; i++) {
//          for (let i = 0; i < maxNonZero - minNonZero + 1; i++) {
                bitmap[i + minNonZero] = parseUint8(inDataView, inOffset);
//              bitmap[i + minNonZero] = parseUint8(inDataView, inOffset);
            }
//          }
        }
//      }

        // Reverse LUT
        // Reverse LUT
        const lut = new Uint16Array(USHORT_RANGE);
//      const lut = new Uint16Array(USHORT_RANGE);
        const maxValue = reverseLutFromBitmap(bitmap, lut);
//      const maxValue = reverseLutFromBitmap(bitmap, lut);

        const length = parseUint32(inDataView, inOffset);
//      const length = parseUint32(inDataView, inOffset);

        // Huffman decoding
        // Huffman decoding
        hufUncompress(
//      hufUncompress(
            info.array,
//          info.array,
            inDataView,
//          inDataView,
            inOffset,
//          inOffset,
            length,
//          length,
            outBuffer,
//          outBuffer,
            outBufferEnd,
//          outBufferEnd,
        );
//      );

        // Wavelet decoding
        // Wavelet decoding
        for (let i = 0; i < info.inputChannels.length; ++i) {
//      for (let i = 0; i < info.inputChannels.length; ++i) {
            const cd = pizChannelData[i];
//          const cd = pizChannelData[i];

            for (let j = 0; j < pizChannelData[i].size; ++j) {
//          for (let j = 0; j < pizChannelData[i].size; ++j) {
                wav2Decode(
//              wav2Decode(
                    outBuffer,
//                  outBuffer,
                    cd.start + j,
//                  cd.start + j,
                    cd.nx,
//                  cd.nx,
                    cd.size,
//                  cd.size,
                    cd.ny,
//                  cd.ny,
                    cd.nx * cd.size,
//                  cd.nx * cd.size,
                    maxValue,
//                  maxValue,
                );
//              );
            }
//          }
        }
//      }

        // Expand the pixel data to their original range
        // Expand the pixel data to their original range
        applyLut(lut, outBuffer, outBufferEnd);
//      applyLut(lut, outBuffer, outBufferEnd);

        // Rearrange the pixel data into the format expected by the caller.
        // Rearrange the pixel data into the format expected by the caller.
        let tmpOffset = 0;
//      let tmpOffset = 0;
        const tmpBuffer = new Uint8Array(outBuffer.buffer.byteLength);
//      const tmpBuffer = new Uint8Array(outBuffer.buffer.byteLength);
        for (let y = 0; y < info.lines; y++) {
//      for (let y = 0; y < info.lines; y++) {
            for (let c = 0; c < info.inputChannels.length; c++) {
//          for (let c = 0; c < info.inputChannels.length; c++) {
                const cd = pizChannelData[c];
//              const cd = pizChannelData[c];

                const n = cd.nx * cd.size;
//              const n = cd.nx * cd.size;
                const cp = new Uint8Array(
//              const cp = new Uint8Array(
                    outBuffer.buffer,
//                  outBuffer.buffer,
                    cd.end * INT16_SIZE,
//                  cd.end * INT16_SIZE,
                    n * INT16_SIZE,
//                  n * INT16_SIZE,
                );
//              );

                tmpBuffer.set(cp, tmpOffset);
//              tmpBuffer.set(cp, tmpOffset);
                tmpOffset += n * INT16_SIZE;
//              tmpOffset += n * INT16_SIZE;
                cd.end += n;
//              cd.end += n;
            }
//          }
        }
//      }

        return new DataView(tmpBuffer.buffer);
//      return new DataView(tmpBuffer.buffer);
    }
//  }



    function uncompressPXR(info) {
//  function uncompressPXR(info) {
        const compressed = info.array.slice(
//      const compressed = info.array.slice(
            info.offset.value,
//          info.offset.value,
            info.offset.value + info.size,
//          info.offset.value + info.size,
        );
//      );

        const rawBuffer = fflate.unzlibSync(compressed);
//      const rawBuffer = fflate.unzlibSync(compressed);

        const byteSize =
//      const byteSize =
            info.inputChannels.length * info.lines * info.columns * info.totalBytes;
//          info.inputChannels.length * info.lines * info.columns * info.totalBytes;
        const tmpBuffer = new ArrayBuffer(byteSize);
//      const tmpBuffer = new ArrayBuffer(byteSize);
        const viewer = new DataView(tmpBuffer);
//      const viewer = new DataView(tmpBuffer);

        let tmpBufferEnd = 0;
//      let tmpBufferEnd = 0;
        let writePtr = 0;
//      let writePtr = 0;
        const ptr = new Array(4);
//      const ptr = new Array(4);

        for (let y = 0; y < info.lines; y++) {
//      for (let y = 0; y < info.lines; y++) {
            for (let c = 0; c < info.inputChannels.length; c++) {
//          for (let c = 0; c < info.inputChannels.length; c++) {
                let pixel = 0;
//              let pixel = 0;

                const type = info.inputChannels[c].pixelType;
//              const type = info.inputChannels[c].pixelType;
                switch (type) {
//              switch (type) {
                    case 1:
//                  case 1:
                        ptr[0] = tmpBufferEnd;
//                      ptr[0] = tmpBufferEnd;
                        ptr[1] = ptr[0] + info.columns;
//                      ptr[1] = ptr[0] + info.columns;
                        tmpBufferEnd = ptr[1] + info.columns;
//                      tmpBufferEnd = ptr[1] + info.columns;

                        for (let j = 0; j < info.columns; ++j) {
//                      for (let j = 0; j < info.columns; ++j) {
                            const diff = (rawBuffer[ptr[0]++] << 8) | rawBuffer[ptr[1]++];
//                          const diff = (rawBuffer[ptr[0]++] << 8) | rawBuffer[ptr[1]++];

                            pixel += diff;
//                          pixel += diff;

                            viewer.setUint16(writePtr, pixel, true);
//                          viewer.setUint16(writePtr, pixel, true);
                            writePtr += 2;
//                          writePtr += 2;
                        }
//                      }

                        break;
//                      break;

                    case 2:
//                  case 2:
                        ptr[0] = tmpBufferEnd;
//                      ptr[0] = tmpBufferEnd;
                        ptr[1] = ptr[0] + info.columns;
//                      ptr[1] = ptr[0] + info.columns;
                        ptr[2] = ptr[1] + info.columns;
//                      ptr[2] = ptr[1] + info.columns;
                        tmpBufferEnd = ptr[2] + info.columns;
//                      tmpBufferEnd = ptr[2] + info.columns;

                        for (let j = 0; j < info.columns; ++j) {
//                      for (let j = 0; j < info.columns; ++j) {
                            const diff =
//                          const diff =
                                (rawBuffer[ptr[0]++] << 24) |
//                              (rawBuffer[ptr[0]++] << 24) |
                                (rawBuffer[ptr[1]++] << 16) |
//                              (rawBuffer[ptr[1]++] << 16) |
                                (rawBuffer[ptr[2]++] << 8);
//                              (rawBuffer[ptr[2]++] << 8);

                            pixel += diff;
//                          pixel += diff;

                            viewer.setUint32(writePtr, pixel, true);
//                          viewer.setUint32(writePtr, pixel, true);
                            writePtr += 4;
//                          writePtr += 4;
                        }
//                      }

                        break;
//                      break;
                }
//              }
            }
//          }
        }
//      }

        return viewer;
//      return viewer;
    }
//  }



    function uncompressDWA(info) {
//  function uncompressDWA(info) {
        const inDataView = info.viewer;
//      const inDataView = info.viewer;
        const inOffset = { value: info.offset.value };
//      const inOffset = { value: info.offset.value };
        const outBuffer = new Uint8Array(
//      const outBuffer = new Uint8Array(
            info.columns *
//          info.columns *
            info.lines *
//          info.lines *
            (info.inputChannels.length * info.type * INT16_SIZE),
//          (info.inputChannels.length * info.type * INT16_SIZE),
        );
//      );

        // Read compression header information
        // Read compression header information
        const dwaHeader = {
//      const dwaHeader = {
            version: parseInt64(inDataView, inOffset),
//          version: parseInt64(inDataView, inOffset),
            unknownUncompressedSize: parseInt64(inDataView, inOffset),
//          unknownUncompressedSize: parseInt64(inDataView, inOffset),
            unknownCompressedSize: parseInt64(inDataView, inOffset),
//          unknownCompressedSize: parseInt64(inDataView, inOffset),
            acCompressedSize: parseInt64(inDataView, inOffset),
//          acCompressedSize: parseInt64(inDataView, inOffset),
            dcCompressedSize: parseInt64(inDataView, inOffset),
//          dcCompressedSize: parseInt64(inDataView, inOffset),
            rleCompressedSize: parseInt64(inDataView, inOffset),
//          rleCompressedSize: parseInt64(inDataView, inOffset),
            rleUncompressedSize: parseInt64(inDataView, inOffset),
//          rleUncompressedSize: parseInt64(inDataView, inOffset),
            rleRawSize: parseInt64(inDataView, inOffset),
//          rleRawSize: parseInt64(inDataView, inOffset),
            totalAcUncompressedCount: parseInt64(inDataView, inOffset),
//          totalAcUncompressedCount: parseInt64(inDataView, inOffset),
            totalDcUncompressedCount: parseInt64(inDataView, inOffset),
//          totalDcUncompressedCount: parseInt64(inDataView, inOffset),
            acCompression: parseInt64(inDataView, inOffset),
//          acCompression: parseInt64(inDataView, inOffset),
        };
//      };

        if (dwaHeader.version < 2)
//      if (dwaHeader.version < 2)
            throw new Error(
//          throw new Error(
                "EXRLoader.parse: " +
//              "EXRLoader.parse: " +
                EXRHeader.compression +
//              EXRHeader.compression +
                " version " +
//              " version " +
                dwaHeader.version +
//              dwaHeader.version +
                " is unsupported",
//              " is unsupported",
            );
//          );

        // Read channel ruleset information
        // Read channel ruleset information
        const channelRules = new Array();
//      const channelRules = new Array();
        let ruleSize = parseUint16(inDataView, inOffset) - INT16_SIZE;
//      let ruleSize = parseUint16(inDataView, inOffset) - INT16_SIZE;

        while (ruleSize > 0) {
//      while (ruleSize > 0) {
            const name = parseNullTerminatedString(inDataView.buffer, inOffset);
//          const name = parseNullTerminatedString(inDataView.buffer, inOffset);
            const value = parseUint8(inDataView, inOffset);
//          const value = parseUint8(inDataView, inOffset);
            const compression = (value >> 2) & 3;
//          const compression = (value >> 2) & 3;
            const csc = (value >> 4) - 1;
//          const csc = (value >> 4) - 1;
            const index = new Int8Array([csc])[0];
//          const index = new Int8Array([csc])[0];
            const type = parseUint8(inDataView, inOffset);
//          const type = parseUint8(inDataView, inOffset);

            channelRules.push({
//          channelRules.push({
                name: name,
//              name: name,
                index: index,
//              index: index,
                type: type,
//              type: type,
                compression: compression,
//              compression: compression,
            });
//          });

            ruleSize -= name.length + 3;
//          ruleSize -= name.length + 3;
        }
//      }

        // Classify channels
        // Classify channels
        const channels = EXRHeader.channels;
//      const channels = EXRHeader.channels;
        const channelData = new Array(info.inputChannels.length);
//      const channelData = new Array(info.inputChannels.length);

        for (let i = 0; i < info.inputChannels.length; ++i) {
//      for (let i = 0; i < info.inputChannels.length; ++i) {
            const cd = (channelData[i] = {});
//          const cd = (channelData[i] = {});
            const channel = channels[i];
//          const channel = channels[i];

            cd.name = channel.name;
//          cd.name = channel.name;
            cd.compression = UNKNOWN;
//          cd.compression = UNKNOWN;
            cd.decoded = false;
//          cd.decoded = false;
            cd.type = channel.pixelType;
//          cd.type = channel.pixelType;
            cd.pLinear = channel.pLinear;
//          cd.pLinear = channel.pLinear;
            cd.width = info.columns;
//          cd.width = info.columns;
            cd.height = info.lines;
//          cd.height = info.lines;
        }
//      }

        const cscSet = {
//      const cscSet = {
            idx: new Array(3),
//          idx: new Array(3),
        };
//      };

        for (let offset = 0; offset < info.inputChannels.length; ++offset) {
//      for (let offset = 0; offset < info.inputChannels.length; ++offset) {
            const cd = channelData[offset];
//          const cd = channelData[offset];

            for (let i = 0; i < channelRules.length; ++i) {
//          for (let i = 0; i < channelRules.length; ++i) {
                const rule = channelRules[i];
//              const rule = channelRules[i];

                if (cd.name == rule.name) {
//              if (cd.name == rule.name) {
                    cd.compression = rule.compression;
//                  cd.compression = rule.compression;

                    if (rule.index >= 0) {
//                  if (rule.index >= 0) {
                        cscSet.idx[rule.index] = offset;
//                      cscSet.idx[rule.index] = offset;
                    }
//                  }

                    cd.offset = offset;
//                  cd.offset = offset;
                }
//              }
            }
//          }
        }
//      }

        let acBuffer, dcBuffer, rleBuffer;
//      let acBuffer, dcBuffer, rleBuffer;

        // Read DCT - AC component data
        // Read DCT - AC component data
        if (dwaHeader.acCompressedSize > 0) {
//      if (dwaHeader.acCompressedSize > 0) {
            switch (dwaHeader.acCompression) {
//          switch (dwaHeader.acCompression) {
                case STATIC_HUFFMAN:
//              case STATIC_HUFFMAN:
                    acBuffer = new Uint16Array(dwaHeader.totalAcUncompressedCount);
//                  acBuffer = new Uint16Array(dwaHeader.totalAcUncompressedCount);
                    hufUncompress(
//                  hufUncompress(
                        info.array,
//                      info.array,
                        inDataView,
//                      inDataView,
                        inOffset,
//                      inOffset,
                        dwaHeader.acCompressedSize,
//                      dwaHeader.acCompressedSize,
                        acBuffer,
//                      acBuffer,
                        dwaHeader.totalAcUncompressedCount,
//                      dwaHeader.totalAcUncompressedCount,
                    );
//                  );
                    break;
//                  break;

                case DEFLATE:
//              case DEFLATE:
                    const compressed = info.array.slice(
//                  const compressed = info.array.slice(
                        inOffset.value,
//                      inOffset.value,
                        inOffset.value + dwaHeader.totalAcUncompressedCount,
//                      inOffset.value + dwaHeader.totalAcUncompressedCount,
                    );
//                  );
                    const data = fflate.unzlibSync(compressed);
//                  const data = fflate.unzlibSync(compressed);
                    acBuffer = new Uint16Array(data.buffer);
//                  acBuffer = new Uint16Array(data.buffer);
                    inOffset.value += dwaHeader.totalAcUncompressedCount;
//                  inOffset.value += dwaHeader.totalAcUncompressedCount;
                    break;
//                  break;
            }
//          }
        }
//      }

        // Read DCT - DC component data
        // Read DCT - DC component data
        if (dwaHeader.dcCompressedSize > 0) {
//      if (dwaHeader.dcCompressedSize > 0) {
            const zlibInfo = {
//          const zlibInfo = {
                array: info.array,
//              array: info.array,
                offset: inOffset,
//              offset: inOffset,
                size: dwaHeader.dcCompressedSize,
//              size: dwaHeader.dcCompressedSize,
            };
//          };
            dcBuffer = new Uint16Array(uncompressZIP(zlibInfo).buffer);
//          dcBuffer = new Uint16Array(uncompressZIP(zlibInfo).buffer);
            inOffset.value += dwaHeader.dcCompressedSize;
//          inOffset.value += dwaHeader.dcCompressedSize;
        }
//      }

        // Read RLE compressed data
        // Read RLE compressed data
        if (dwaHeader.rleRawSize > 0) {
//      if (dwaHeader.rleRawSize > 0) {
            const compressed = info.array.slice(
//          const compressed = info.array.slice(
                inOffset.value,
//              inOffset.value,
                inOffset.value + dwaHeader.rleCompressedSize,
//              inOffset.value + dwaHeader.rleCompressedSize,
            );
//          );
            const data = fflate.unzlibSync(compressed);
//          const data = fflate.unzlibSync(compressed);
            rleBuffer = decodeRunLength(data.buffer);
//          rleBuffer = decodeRunLength(data.buffer);

            inOffset.value += dwaHeader.rleCompressedSize;
//          inOffset.value += dwaHeader.rleCompressedSize;
        }
//      }

        // Prepare outbuffer data offset
        // Prepare outbuffer data offset
        let outBufferEnd = 0;
//      let outBufferEnd = 0;
        const rowOffsets = new Array(channelData.length);
//      const rowOffsets = new Array(channelData.length);
        for (let i = 0; i < rowOffsets.length; ++i) {
//      for (let i = 0; i < rowOffsets.length; ++i) {
            rowOffsets[i] = new Array();
//          rowOffsets[i] = new Array();
        }
//      }

        for (let y = 0; y < info.lines; ++y) {
//      for (let y = 0; y < info.lines; ++y) {
            for (let chan = 0; chan < channelData.length; ++chan) {
//          for (let chan = 0; chan < channelData.length; ++chan) {
                rowOffsets[chan].push(outBufferEnd);
//              rowOffsets[chan].push(outBufferEnd);
                outBufferEnd += channelData[chan].width * info.type * INT16_SIZE;
//              outBufferEnd += channelData[chan].width * info.type * INT16_SIZE;
            }
//          }
        }
//      }

        // Lossy DCT decode RGB channels
        // Lossy DCT decode RGB channels
        lossyDctDecode(
//      lossyDctDecode(
            cscSet,
//          cscSet,
            rowOffsets,
//          rowOffsets,
            channelData,
//          channelData,
            acBuffer,
//          acBuffer,
            dcBuffer,
//          dcBuffer,
            outBuffer,
//          outBuffer,
        );
//      );

        // Decode other channels
        // Decode other channels
        for (let i = 0; i < channelData.length; ++i) {
//      for (let i = 0; i < channelData.length; ++i) {
            const cd = channelData[i];
//          const cd = channelData[i];

            if (cd.decoded) continue;
//          if (cd.decoded) continue;

            switch (cd.compression) {
//          switch (cd.compression) {
                case RLE:
//              case RLE:
                    let row = 0;
//                  let row = 0;
                    let rleOffset = 0;
//                  let rleOffset = 0;

                    for (let y = 0; y < info.lines; ++y) {
//                  for (let y = 0; y < info.lines; ++y) {
                        let rowOffsetBytes = rowOffsets[i][row];
//                      let rowOffsetBytes = rowOffsets[i][row];

                        for (let x = 0; x < cd.width; ++x) {
//                      for (let x = 0; x < cd.width; ++x) {
                            for (let byte = 0; byte < INT16_SIZE * cd.type; ++byte) {
//                          for (let byte = 0; byte < INT16_SIZE * cd.type; ++byte) {
                                outBuffer[rowOffsetBytes++] =
//                              outBuffer[rowOffsetBytes++] =
                                    rleBuffer[rleOffset + byte * cd.width * cd.height];
//                                  rleBuffer[rleOffset + byte * cd.width * cd.height];
                            }
//                          }

                            rleOffset++;
//                          rleOffset++;
                        }
//                      }

                        row++;
//                      row++;
                    }
//                  }

                    break;
//                  break;

                case LOSSY_DCT: // skip
//              case LOSSY_DCT: // skip

                default:
//              default:
                    throw new Error("EXRLoader.parse: unsupported channel compression");
//                  throw new Error("EXRLoader.parse: unsupported channel compression");
            }
//          }
        }
//      }

        return new DataView(outBuffer.buffer);
//      return new DataView(outBuffer.buffer);
    }
//  }



    function parseNullTerminatedString(buffer, offset) {
//  function parseNullTerminatedString(buffer, offset) {
        const uintBuffer = new Uint8Array(buffer);
//      const uintBuffer = new Uint8Array(buffer);
        let endOffset = 0;
//      let endOffset = 0;

        while (uintBuffer[offset.value + endOffset] != 0) {
//      while (uintBuffer[offset.value + endOffset] != 0) {
            endOffset += 1;
//          endOffset += 1;
        }
//      }

        const stringValue = new TextDecoder().decode(
//      const stringValue = new TextDecoder().decode(
            uintBuffer.slice(offset.value, offset.value + endOffset),
//          uintBuffer.slice(offset.value, offset.value + endOffset),
        );
//      );

        offset.value = offset.value + endOffset + 1;
//      offset.value = offset.value + endOffset + 1;

        return stringValue;
//      return stringValue;
    }
//  }



    function parseFixedLengthString(buffer, offset, size) {
//  function parseFixedLengthString(buffer, offset, size) {
        const stringValue = new TextDecoder().decode(
//      const stringValue = new TextDecoder().decode(
            new Uint8Array(buffer).slice(offset.value, offset.value + size),
//          new Uint8Array(buffer).slice(offset.value, offset.value + size),
        );
//      );

        offset.value = offset.value + size;
//      offset.value = offset.value + size;

        return stringValue;
//      return stringValue;
    }
//  }



    function parseRational(dataView, offset) {
//  function parseRational(dataView, offset) {
        const x = parseInt32(dataView, offset);
//      const x = parseInt32(dataView, offset);
        const y = parseUint32(dataView, offset);
//      const y = parseUint32(dataView, offset);

        return [x, y];
//      return [x, y];
    }
//  }



    function parseTimecode(dataView, offset) {
//  function parseTimecode(dataView, offset) {
        const x = parseUint32(dataView, offset);
//      const x = parseUint32(dataView, offset);
        const y = parseUint32(dataView, offset);
//      const y = parseUint32(dataView, offset);

        return [x, y];
//      return [x, y];
    }
//  }



    function parseInt32(dataView, offset) {
//  function parseInt32(dataView, offset) {
        const Int32 = dataView.getInt32(offset.value, true);
//      const Int32 = dataView.getInt32(offset.value, true);

        offset.value = offset.value + INT32_SIZE;
//      offset.value = offset.value + INT32_SIZE;

        return Int32;
//      return Int32;
    }
//  }



    function parseUint32(dataView, offset) {
//  function parseUint32(dataView, offset) {
        const Uint32 = dataView.getUint32(offset.value, true);
//      const Uint32 = dataView.getUint32(offset.value, true);

        offset.value = offset.value + INT32_SIZE;
//      offset.value = offset.value + INT32_SIZE;

        return Uint32;
//      return Uint32;
    }
//  }



    function parseUint8Array(uInt8Array, offset) {
//  function parseUint8Array(uInt8Array, offset) {
        const Uint8 = uInt8Array[offset.value];
//      const Uint8 = uInt8Array[offset.value];

        offset.value = offset.value + INT8_SIZE;
//      offset.value = offset.value + INT8_SIZE;

        return Uint8;
//      return Uint8;
    }
//  }



    function parseUint8(dataView, offset) {
//  function parseUint8(dataView, offset) {
        const Uint8 = dataView.getUint8(offset.value);
//      const Uint8 = dataView.getUint8(offset.value);

        offset.value = offset.value + INT8_SIZE;
//      offset.value = offset.value + INT8_SIZE;

        return Uint8;
//      return Uint8;
    }
//  }



    const parseInt64 = function (dataView, offset) {
//  const parseInt64 = function (dataView, offset) {
        let int;
//      let int;

        if ("getBigInt64" in DataView.prototype) {
//      if ("getBigInt64" in DataView.prototype) {
            int = Number(dataView.getBigInt64(offset.value, true));
//          int = Number(dataView.getBigInt64(offset.value, true));
        } else {
//      } else {
            int =
//          int =
                dataView.getUint32(offset.value + 4, true) +
//              dataView.getUint32(offset.value + 4, true) +
                Number(dataView.getUint32(offset.value, true) << 32);
//              Number(dataView.getUint32(offset.value, true) << 32);
        }
//      }

        offset.value += ULONG_SIZE;
//      offset.value += ULONG_SIZE;

        return int;
//      return int;
    };
//  };



    function parseFloat32(dataView, offset) {
//  function parseFloat32(dataView, offset) {
        const float = dataView.getFloat32(offset.value, true);
//      const float = dataView.getFloat32(offset.value, true);

        offset.value += FLOAT32_SIZE;
//      offset.value += FLOAT32_SIZE;

        return float;
//      return float;
    }
//  }



    function decodeFloat32(dataView, offset) {
//  function decodeFloat32(dataView, offset) {
        return DataUtils.toHalfFloat(parseFloat32(dataView, offset));
//      return DataUtils.toHalfFloat(parseFloat32(dataView, offset));
    }
//  }



    // https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
    // https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
    function decodeFloat16(binary) {
//  function decodeFloat16(binary) {
        const exponent = (binary & 0x7c00) >> 10,
//      const exponent = (binary & 0x7c00) >> 10,
            fraction = binary & 0x03ff;
//          fraction = binary & 0x03ff;

        return (
//      return (
            (binary >> 15 ? -1 : 1) *
//          (binary >> 15 ? -1 : 1) *
            (exponent
//          (exponent
                ? exponent === 0x1f
//              ? exponent === 0x1f
                    ? fraction
//                  ? fraction
                        ? NaN
//                      ? NaN
                        : Infinity
//                      : Infinity
                    : Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
//                  : Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
                : 6.103515625e-5 * (fraction / 0x400))
//              : 6.103515625e-5 * (fraction / 0x400))
        );
//      );
    }
//  }



        function parseUint16(dataView, offset) {
//      function parseUint16(dataView, offset) {
            const Uint16 = dataView.getUint16(offset.value, true);
//          const Uint16 = dataView.getUint16(offset.value, true);

            offset.value += INT16_SIZE;
//          offset.value += INT16_SIZE;

            return Uint16;
//          return Uint16;
        }
//      }



        function parseFloat16(buffer, offset) {
//      function parseFloat16(buffer, offset) {
            return decodeFloat16(parseUint16(buffer, offset));
//          return decodeFloat16(parseUint16(buffer, offset));
        }
//      }



        function parseChlist(dataView, buffer, offset, size) {
//      function parseChlist(dataView, buffer, offset, size) {
            const startOffset = offset.value;
//          const startOffset = offset.value;
            const channels = [];
//          const channels = [];

            while (offset.value < startOffset + size - 1) {
//          while (offset.value < startOffset + size - 1) {
                const name = parseNullTerminatedString(buffer, offset);
//              const name = parseNullTerminatedString(buffer, offset);
                const pixelType = parseInt32(dataView, offset);
//              const pixelType = parseInt32(dataView, offset);
                const pLinear = parseUint8(dataView, offset);
//              const pLinear = parseUint8(dataView, offset);
                offset.value += 3; // reserved, three chars
//              offset.value += 3; // reserved, three chars
                const xSampling = parseInt32(dataView, offset);
//              const xSampling = parseInt32(dataView, offset);
                const ySampling = parseInt32(dataView, offset);
//              const ySampling = parseInt32(dataView, offset);

                channels.push({
//              channels.push({
                    name: name,
//                  name: name,
                    pixelType: pixelType,
//                  pixelType: pixelType,
                    pLinear: pLinear,
//                  pLinear: pLinear,
                    xSampling: xSampling,
//                  xSampling: xSampling,
                    ySampling: ySampling,
//                  ySampling: ySampling,
                });
//              });
            }
//          }

            offset.value += 1;
//          offset.value += 1;

            return channels;
//          return channels;
        }
//      }



        function parseChromaticities(dataView, offset) {
//      function parseChromaticities(dataView, offset) {
            const redX = parseFloat32(dataView, offset);
//          const redX = parseFloat32(dataView, offset);
            const redY = parseFloat32(dataView, offset);
//          const redY = parseFloat32(dataView, offset);
            const greenX = parseFloat32(dataView, offset);
//          const greenX = parseFloat32(dataView, offset);
            const greenY = parseFloat32(dataView, offset);
//          const greenY = parseFloat32(dataView, offset);
            const blueX = parseFloat32(dataView, offset);
//          const blueX = parseFloat32(dataView, offset);
            const blueY = parseFloat32(dataView, offset);
//          const blueY = parseFloat32(dataView, offset);
            const whiteX = parseFloat32(dataView, offset);
//          const whiteX = parseFloat32(dataView, offset);
            const whiteY = parseFloat32(dataView, offset);
//          const whiteY = parseFloat32(dataView, offset);

            return {
//          return {
                redX: redX,
//              redX: redX,
                redY: redY,
//              redY: redY,
                greenX: greenX,
//              greenX: greenX,
                greenY: greenY,
//              greenY: greenY,
                blueX: blueX,
//              blueX: blueX,
                blueY: blueY,
//              blueY: blueY,
                whiteX: whiteX,
//              whiteX: whiteX,
                whiteY: whiteY,
//              whiteY: whiteY,
            };
//          };
        }
//      }



        function parseCompression(dataView, offset) {
//      function parseCompression(dataView, offset) {
            const compressionCodes = [
//          const compressionCodes = [
                "NO_COMPRESSION",
//              "NO_COMPRESSION",
                "RLE_COMPRESSION",
//              "RLE_COMPRESSION",
                "ZIPS_COMPRESSION",
//              "ZIPS_COMPRESSION",
                "ZIP_COMPRESSION",
//              "ZIP_COMPRESSION",
                "PIZ_COMPRESSION",
//              "PIZ_COMPRESSION",
                "PXR24_COMPRESSION",
//              "PXR24_COMPRESSION",
                "B44_COMPRESSION",
//              "B44_COMPRESSION",
                "B44A_COMPRESSION",
//              "B44A_COMPRESSION",
                "DWAA_COMPRESSION",
//              "DWAA_COMPRESSION",
                "DWAB_COMPRESSION",
//              "DWAB_COMPRESSION",
            ];
//          ];

            const compression = parseUint8(dataView, offset);
//          const compression = parseUint8(dataView, offset);

            return compressionCodes[compression];
//          return compressionCodes[compression];
        }
//      }



        function parseBox2i(dataView, offset) {
//      function parseBox2i(dataView, offset) {
            const xMin = parseInt32(dataView, offset);
//          const xMin = parseInt32(dataView, offset);
            const yMin = parseInt32(dataView, offset);
//          const yMin = parseInt32(dataView, offset);
            const xMax = parseInt32(dataView, offset);
//          const xMax = parseInt32(dataView, offset);
            const yMax = parseInt32(dataView, offset);
//          const yMax = parseInt32(dataView, offset);

            return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };
//          return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };
        }
//      }



        function parseLineOrder(dataView, offset) {
//      function parseLineOrder(dataView, offset) {
            const lineOrders = ["INCREASING_Y", "DECREASING_Y", "RANDOM_Y"];
//          const lineOrders = ["INCREASING_Y", "DECREASING_Y", "RANDOM_Y"];

            const lineOrder = parseUint8(dataView, offset);
//          const lineOrder = parseUint8(dataView, offset);

            return lineOrders[lineOrder];
//          return lineOrders[lineOrder];
        }
//      }



        function parseEnvmap(dataView, offset) {
//      function parseEnvmap(dataView, offset) {
            const envmaps = ["ENVMAP_LATLONG", "ENVMAP_CUBE"];
//          const envmaps = ["ENVMAP_LATLONG", "ENVMAP_CUBE"];

            const envmap = parseUint8(dataView, offset);
//          const envmap = parseUint8(dataView, offset);

            return envmaps[envmap];
//          return envmaps[envmap];
        }
//      }



        function parseTiledesc(dataView, offset) {
//      function parseTiledesc(dataView, offset) {
            const levelModes = ["ONE_LEVEL", "MIPMAP_LEVELS", "RIPMAP_LEVELS"];
//          const levelModes = ["ONE_LEVEL", "MIPMAP_LEVELS", "RIPMAP_LEVELS"];

            const roundingModes = ["ROUND_DOWN", "ROUND_UP"];
//          const roundingModes = ["ROUND_DOWN", "ROUND_UP"];

            const xSize = parseUint32(dataView, offset);
//          const xSize = parseUint32(dataView, offset);
            const ySize = parseUint32(dataView, offset);
//          const ySize = parseUint32(dataView, offset);
            const modes = parseUint8(dataView, offset);
//          const modes = parseUint8(dataView, offset);

            return {
//          return {
                xSize: xSize,
//              xSize: xSize,
                ySize: ySize,
//              ySize: ySize,
                levelMode: levelModes[modes & 0xf],
//              levelMode: levelModes[modes & 0xf],
                roundingMode: roundingModes[modes >> 4],
//              roundingMode: roundingModes[modes >> 4],
            };
//          };
        }
//      }



        function parseV2f(dataView, offset) {
//      function parseV2f(dataView, offset) {
            const x = parseFloat32(dataView, offset);
//          const x = parseFloat32(dataView, offset);
            const y = parseFloat32(dataView, offset);
//          const y = parseFloat32(dataView, offset);

            return [x, y];
//          return [x, y];
        }
//      }



        function parseV3f(dataView, offset) {
//      function parseV3f(dataView, offset) {
            const x = parseFloat32(dataView, offset);
//          const x = parseFloat32(dataView, offset);
            const y = parseFloat32(dataView, offset);
//          const y = parseFloat32(dataView, offset);
            const z = parseFloat32(dataView, offset);
//          const z = parseFloat32(dataView, offset);

            return [x, y, z];
//          return [x, y, z];
        }
//      }



        function parseValue(dataView, buffer, offset, type, size) {
//      function parseValue(dataView, buffer, offset, type, size) {
            if (type === "string" || type === "stringvector" || type === "iccProfile") {
//          if (type === "string" || type === "stringvector" || type === "iccProfile") {
                return parseFixedLengthString(buffer, offset, size);
//              return parseFixedLengthString(buffer, offset, size);
            } else if (type === "chlist") {
//          } else if (type === "chlist") {
                return parseChlist(dataView, buffer, offset, size);
//              return parseChlist(dataView, buffer, offset, size);
            } else if (type === "chromaticities") {
//          } else if (type === "chromaticities") {
                return parseChromaticities(dataView, offset);
//              return parseChromaticities(dataView, offset);
            } else if (type === "compression") {
//          } else if (type === "compression") {
                return parseCompression(dataView, offset);
//              return parseCompression(dataView, offset);
            } else if (type === "box2i") {
//          } else if (type === "box2i") {
                return parseBox2i(dataView, offset);
//              return parseBox2i(dataView, offset);
            } else if (type === "envmap") {
//          } else if (type === "envmap") {
                return parseEnvmap(dataView, offset);
//              return parseEnvmap(dataView, offset);
            } else if (type === "tiledesc") {
//          } else if (type === "tiledesc") {
                return parseTiledesc(dataView, offset);
//              return parseTiledesc(dataView, offset);
            } else if (type === "lineOrder") {
//          } else if (type === "lineOrder") {
                return parseLineOrder(dataView, offset);
//              return parseLineOrder(dataView, offset);
            } else if (type === "float") {
//          } else if (type === "float") {
                return parseFloat32(dataView, offset);
//              return parseFloat32(dataView, offset);
            } else if (type === "v2f") {
//          } else if (type === "v2f") {
                return parseV2f(dataView, offset);
//              return parseV2f(dataView, offset);
            } else if (type === "v3f") {
//          } else if (type === "v3f") {
                return parseV3f(dataView, offset);
//              return parseV3f(dataView, offset);
            } else if (type === "int") {
//          } else if (type === "int") {
                return parseInt32(dataView, offset);
//              return parseInt32(dataView, offset);
            } else if (type === "rational") {
//          } else if (type === "rational") {
                return parseRational(dataView, offset);
//              return parseRational(dataView, offset);
            } else if (type === "timecode") {
//          } else if (type === "timecode") {
                return parseTimecode(dataView, offset);
//              return parseTimecode(dataView, offset);
            } else if (type === "preview") {
//          } else if (type === "preview") {
                offset.value += size;
//              offset.value += size;
                return "skipped";
//              return "skipped";
            } else {
//          } else {
                offset.value += size;
//              offset.value += size;
                return undefined;
//              return undefined;
            }
//          }
        }
//      }



        function roundLog2(x, mode) {
//      function roundLog2(x, mode) {
            const log2 = Math.log2(x);
//          const log2 = Math.log2(x);
            return mode == "ROUND_DOWN" ? Math.floor(log2) : Math.ceil(log2);
//          return mode == "ROUND_DOWN" ? Math.floor(log2) : Math.ceil(log2);
        }
//      }



        function calculateTileLevels(tiledesc, w, h) {
//      function calculateTileLevels(tiledesc, w, h) {
            let num = 0;
//          let num = 0;

            switch (tiledesc.levelMode) {
//          switch (tiledesc.levelMode) {
                case "ONE_LEVEL":
//              case "ONE_LEVEL":
                    num = 1;
//                  num = 1;
                    break;
//                  break;

                case "MIPMAP_LEVELS":
//              case "MIPMAP_LEVELS":
                    num = roundLog2(Math.max(w, h), tiledesc.roundingMode) + 1;
//                  num = roundLog2(Math.max(w, h), tiledesc.roundingMode) + 1;
                    break;
//                  break;

                case "RIPMAP_LEVELS":
//              case "RIPMAP_LEVELS":
                    throw new Error(
//                  throw new Error(
                        "EXRLoader: RIPMAP_LEVELS tiles currently unsupported.",
//                      "EXRLoader: RIPMAP_LEVELS tiles currently unsupported.",
                    );
//                  );
            }
//          }

            return num;
//          return num;
        }
//      }



        function calculateTiles(count, dataSize, size, roundingMode) {
//      function calculateTiles(count, dataSize, size, roundingMode) {
            const tiles = new Array(count);
//          const tiles = new Array(count);

            for (let i = 0; i < count; i++) {
//          for (let i = 0; i < count; i++) {
                const b = 1 << i;
//              const b = 1 << i;
                let s = (dataSize / b) | 0;
//              let s = (dataSize / b) | 0;

                if (roundingMode == "ROUND_UP" && s * b < dataSize) s += 1;
//              if (roundingMode == "ROUND_UP" && s * b < dataSize) s += 1;

                const l = Math.max(s, 1);
//              const l = Math.max(s, 1);

                tiles[i] = ((l + size - 1) / size) | 0;
//              tiles[i] = ((l + size - 1) / size) | 0;
            }
//          }

            return tiles;
//          return tiles;
        }
//      }



        function parseTiles(EXRDecoder) {
//      function parseTiles(EXRDecoder) {
            const offset = EXRDecoder.offset;
//          const offset = EXRDecoder.offset;
            const tmpOffset = { value: 0 };
//          const tmpOffset = { value: 0 };

            for (let tile = 0; tile < EXRDecoder.tileCount; tile++) {
//          for (let tile = 0; tile < EXRDecoder.tileCount; tile++) {
                const tileX = parseInt32(EXRDecoder.viewer, offset);
//              const tileX = parseInt32(EXRDecoder.viewer, offset);
                const tileY = parseInt32(EXRDecoder.viewer, offset);
//              const tileY = parseInt32(EXRDecoder.viewer, offset);
                offset.value += 8; // skip levels - only parsing top-level
//              offset.value += 8; // skip levels - only parsing top-level
                EXRDecoder.size = parseUint32(EXRDecoder.viewer, offset);
//              EXRDecoder.size = parseUint32(EXRDecoder.viewer, offset);

                const startX = tileX * EXRDecoder.blockWidth;
//              const startX = tileX * EXRDecoder.blockWidth;
                const startY = tileY * EXRDecoder.blockHeight;
//              const startY = tileY * EXRDecoder.blockHeight;
                EXRDecoder.columns =
//              EXRDecoder.columns =
                    startX + EXRDecoder.blockWidth > EXRDecoder.width
//                  startX + EXRDecoder.blockWidth > EXRDecoder.width
                        ? EXRDecoder.width - startX
//                      ? EXRDecoder.width - startX
                        : EXRDecoder.blockWidth;
//                      : EXRDecoder.blockWidth;
                EXRDecoder.lines =
//              EXRDecoder.lines =
                    startY + EXRDecoder.blockHeight > EXRDecoder.height
//                  startY + EXRDecoder.blockHeight > EXRDecoder.height
                        ? EXRDecoder.height - startY
//                      ? EXRDecoder.height - startY
                        : EXRDecoder.blockHeight;
//                      : EXRDecoder.blockHeight;

                const bytesBlockLine = EXRDecoder.columns * EXRDecoder.totalBytes;
//              const bytesBlockLine = EXRDecoder.columns * EXRDecoder.totalBytes;
                const isCompressed = EXRDecoder.size < EXRDecoder.lines * bytesBlockLine;
//              const isCompressed = EXRDecoder.size < EXRDecoder.lines * bytesBlockLine;
                const viewer = isCompressed
//              const viewer = isCompressed
                    ? EXRDecoder.uncompress(EXRDecoder)
//                  ? EXRDecoder.uncompress(EXRDecoder)
                    : uncompressRAW(EXRDecoder);
//                  : uncompressRAW(EXRDecoder);

                offset.value += EXRDecoder.size;
//              offset.value += EXRDecoder.size;

                for (let line = 0; line < EXRDecoder.lines; line++) {
//              for (let line = 0; line < EXRDecoder.lines; line++) {
                    const lineOffset = line * EXRDecoder.columns * EXRDecoder.totalBytes;
//                  const lineOffset = line * EXRDecoder.columns * EXRDecoder.totalBytes;

                    for (
//                  for (
                        let channelID = 0;
//                      let channelID = 0;
                        channelID < EXRDecoder.inputChannels.length;
//                      channelID < EXRDecoder.inputChannels.length;
                        channelID++
//                      channelID++
                    ) {
//                  ) {
                        const name = EXRHeader.channels[channelID].name;
//                      const name = EXRHeader.channels[channelID].name;
                        const lOff = EXRDecoder.channelByteOffsets[name] * EXRDecoder.columns;
//                      const lOff = EXRDecoder.channelByteOffsets[name] * EXRDecoder.columns;
                        const cOff = EXRDecoder.decodeChannels[name];
//                      const cOff = EXRDecoder.decodeChannels[name];

                        if (cOff === undefined) continue;
//                      if (cOff === undefined) continue;

                        tmpOffset.value = lineOffset + lOff;
//                      tmpOffset.value = lineOffset + lOff;
                        const outLineOffset =
//                      const outLineOffset =
                            (EXRDecoder.height - (1 + startY + line)) * EXRDecoder.outLineWidth;
//                          (EXRDecoder.height - (1 + startY + line)) * EXRDecoder.outLineWidth;

                        for (let x = 0; x < EXRDecoder.columns; x++) {
//                      for (let x = 0; x < EXRDecoder.columns; x++) {
                            const outIndex =
//                          const outIndex =
                                outLineOffset + (x + startX) * EXRDecoder.outputChannels + cOff;
//                              outLineOffset + (x + startX) * EXRDecoder.outputChannels + cOff;
                            EXRDecoder.byteArray[outIndex] = EXRDecoder.getter(
//                          EXRDecoder.byteArray[outIndex] = EXRDecoder.getter(
                                viewer,
//                              viewer,
                                tmpOffset,
//                              tmpOffset,
                            );
//                          );
                        }
//                      }
                    }
//                  }
                }
//              }
            }
//          }
        }
//      }



        function parseScanline(EXRDecoder) {
//      function parseScanline(EXRDecoder) {
            const offset = EXRDecoder.offset;
//          const offset = EXRDecoder.offset;
            const tmpOffset = { value: 0 };
//          const tmpOffset = { value: 0 };

            for (
//          for (
                let scanlineBlockIdx = 0;
//              let scanlineBlockIdx = 0;
                scanlineBlockIdx < EXRDecoder.height / EXRDecoder.blockHeight;
//              scanlineBlockIdx < EXRDecoder.height / EXRDecoder.blockHeight;
                scanlineBlockIdx++
//              scanlineBlockIdx++
            ) {
//          ) {
                const line =
//              const line =
                    parseInt32(EXRDecoder.viewer, offset) - EXRHeader.dataWindow.yMin; // line_no
//                  parseInt32(EXRDecoder.viewer, offset) - EXRHeader.dataWindow.yMin; // line_no
                EXRDecoder.size = parseUint32(EXRDecoder.viewer, offset); // data_len
//              EXRDecoder.size = parseUint32(EXRDecoder.viewer, offset); // data_len
                EXRDecoder.lines =
//              EXRDecoder.lines =
                    line + EXRDecoder.blockHeight > EXRDecoder.height
//                  line + EXRDecoder.blockHeight > EXRDecoder.height
                        ? EXRDecoder.height - line
//                      ? EXRDecoder.height - line
                        : EXRDecoder.blockHeight;
//                      : EXRDecoder.blockHeight;

                const bytesPerLine = EXRDecoder.columns * EXRDecoder.totalBytes;
//              const bytesPerLine = EXRDecoder.columns * EXRDecoder.totalBytes;
                const isCompressed = EXRDecoder.size < EXRDecoder.lines * bytesPerLine;
//              const isCompressed = EXRDecoder.size < EXRDecoder.lines * bytesPerLine;
                const viewer = isCompressed
//              const viewer = isCompressed
                    ? EXRDecoder.uncompress(EXRDecoder)
//                  ? EXRDecoder.uncompress(EXRDecoder)
                    : uncompressRAW(EXRDecoder);
//                  : uncompressRAW(EXRDecoder);

                offset.value += EXRDecoder.size;
//              offset.value += EXRDecoder.size;

                for (let line_y = 0; line_y < EXRDecoder.blockHeight; line_y++) {
//              for (let line_y = 0; line_y < EXRDecoder.blockHeight; line_y++) {
                    const scan_y = scanlineBlockIdx * EXRDecoder.blockHeight;
//                  const scan_y = scanlineBlockIdx * EXRDecoder.blockHeight;
                    const true_y = line_y + EXRDecoder.scanOrder(scan_y);
//                  const true_y = line_y + EXRDecoder.scanOrder(scan_y);
                    if (true_y >= EXRDecoder.height) continue;
//                  if (true_y >= EXRDecoder.height) continue;

                    const lineOffset = line_y * bytesPerLine;
//                  const lineOffset = line_y * bytesPerLine;
                    const outLineOffset =
//                  const outLineOffset =
                        (EXRDecoder.height - 1 - true_y) * EXRDecoder.outLineWidth;
//                      (EXRDecoder.height - 1 - true_y) * EXRDecoder.outLineWidth;

                    for (
//                  for (
                        let channelID = 0;
//                      let channelID = 0;
                        channelID < EXRDecoder.inputChannels.length;
//                      channelID < EXRDecoder.inputChannels.length;
                        channelID++
//                      channelID++
                    ) {
//                  ) {
                        const name = EXRHeader.channels[channelID].name;
//                      const name = EXRHeader.channels[channelID].name;
                        const lOff = EXRDecoder.channelByteOffsets[name] * EXRDecoder.columns;
//                      const lOff = EXRDecoder.channelByteOffsets[name] * EXRDecoder.columns;
                        const cOff = EXRDecoder.decodeChannels[name];
//                      const cOff = EXRDecoder.decodeChannels[name];

                        if (cOff === undefined) continue;
//                      if (cOff === undefined) continue;

                        tmpOffset.value = lineOffset + lOff;
//                      tmpOffset.value = lineOffset + lOff;

                        for (let x = 0; x < EXRDecoder.columns; x++) {
//                      for (let x = 0; x < EXRDecoder.columns; x++) {
                            const outIndex =
//                          const outIndex =
                                outLineOffset + x * EXRDecoder.outputChannels + cOff;
//                              outLineOffset + x * EXRDecoder.outputChannels + cOff;
                            EXRDecoder.byteArray[outIndex] = EXRDecoder.getter(
//                          EXRDecoder.byteArray[outIndex] = EXRDecoder.getter(
                                viewer,
//                              viewer,
                                tmpOffset,
//                              tmpOffset,
                            );
//                          );
                        }
//                      }
                    }
//                  }
                }
//              }
            }
//          }
        }
//      }



        function parseHeader(dataView, buffer, offset) {
//      function parseHeader(dataView, buffer, offset) {
            const EXRHeader = {};
//          const EXRHeader = {};

            if (dataView.getUint32(0, true) != 20000630) {
//          if (dataView.getUint32(0, true) != 20000630) {
                //  magic
                //  magic

                throw new Error(
//              throw new Error(
                    "EXRLoader: Provided file doesn't appear to be in OpenEXR format.",
//                  "EXRLoader: Provided file doesn't appear to be in OpenEXR format.",
                );
//              );
            }
//          }

            EXRHeader.version = dataView.getUint8(4);
//          EXRHeader.version = dataView.getUint8(4);

            const spec = dataView.getUint8(5); // fullMask
//          const spec = dataView.getUint8(5); // fullMask

            EXRHeader.spec = {
//          EXRHeader.spec = {
                singleTile: !!(spec & 2),
//              singleTile: !!(spec & 2),
                longName: !!(spec & 4),
//              longName: !!(spec & 4),
                deepFormat: !!(spec & 8),
//              deepFormat: !!(spec & 8),
                multiPart: !!(spec & 16),
//              multiPart: !!(spec & 16),
            };
//          };

            //  start of header
            //  start of header

            offset.value = 8; // start at 8 - after pre-amble
//          offset.value = 8; // start at 8 - after pre-amble

            let keepReading = true;
//          let keepReading = true;

            while (keepReading) {
//          while (keepReading) {
                const attributeName = parseNullTerminatedString(buffer, offset);
//              const attributeName = parseNullTerminatedString(buffer, offset);

                if (attributeName == 0) {
//              if (attributeName == 0) {
                    keepReading = false;
//                  keepReading = false;
                } else {
//              } else {
                    const attributeType = parseNullTerminatedString(buffer, offset);
//                  const attributeType = parseNullTerminatedString(buffer, offset);
                    const attributeSize = parseUint32(dataView, offset);
//                  const attributeSize = parseUint32(dataView, offset);
                    const attributeValue = parseValue(
//                  const attributeValue = parseValue(
                        dataView,
//                      dataView,
                        buffer,
//                      buffer,
                        offset,
//                      offset,
                        attributeType,
//                      attributeType,
                        attributeSize,
//                      attributeSize,
                    );
//                  );

                    if (attributeValue === undefined) {
//                  if (attributeValue === undefined) {
                        console.warn(
//                      console.warn(
                            `EXRLoader: Skipped unknown header attribute type \'${attributeType}\'.`,
//                          `EXRLoader: Skipped unknown header attribute type \'${attributeType}\'.`,
                        );
//                      );
                    } else {
//                  } else {
                        EXRHeader[attributeName] = attributeValue;
//                      EXRHeader[attributeName] = attributeValue;
                    }
//                  }
                }
//              }
            }
//          }

            if ((spec & ~0x06) != 0) {
//          if ((spec & ~0x06) != 0) {
                //  unsupported deep-image, multi-part
                //  unsupported deep-image, multi-part

                console.error("EXRHeader:", EXRHeader);
//              console.error("EXRHeader:", EXRHeader);
                throw new Error("EXRLoader: Provided file is currently unsupported.");
//              throw new Error("EXRLoader: Provided file is currently unsupported.");
            }
//          }

            return EXRHeader;
//          return EXRHeader;
        }
//      }



        function setupDecoder(EXRHeader, dataView, uInt8Array, offset, outputType) {
//      function setupDecoder(EXRHeader, dataView, uInt8Array, offset, outputType) {
            const EXRDecoder = {
//          const EXRDecoder = {
                size: 0,
//              size: 0,
                viewer: dataView,
//              viewer: dataView,
                array: uInt8Array,
//              array: uInt8Array,
                offset: offset,
//              offset: offset,
                width: EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1,
//              width: EXRHeader.dataWindow.xMax - EXRHeader.dataWindow.xMin + 1,
                height: EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1,
//              height: EXRHeader.dataWindow.yMax - EXRHeader.dataWindow.yMin + 1,
                inputChannels: EXRHeader.channels,
//              inputChannels: EXRHeader.channels,
                channelByteOffsets: {},
//              channelByteOffsets: {},
                scanOrder: null,
//              scanOrder: null,
                totalBytes: null,
//              totalBytes: null,
                columns: null,
//              columns: null,
                lines: null,
//              lines: null,
                type: null,
//              type: null,
                uncompress: null,
//              uncompress: null,
                getter: null,
//              getter: null,
                format: null,
//              format: null,
                colorSpace: LinearSRGBColorSpace,
//              colorSpace: LinearSRGBColorSpace,
            };
//          };

            switch (EXRHeader.compression) {
//          switch (EXRHeader.compression) {
                case "NO_COMPRESSION":
//              case "NO_COMPRESSION":
                    EXRDecoder.blockHeight = 1;
//                  EXRDecoder.blockHeight = 1;
                    EXRDecoder.uncompress = uncompressRAW;
//                  EXRDecoder.uncompress = uncompressRAW;
                    break;
//                  break;

                case "RLE_COMPRESSION":
//              case "RLE_COMPRESSION":
                    EXRDecoder.blockHeight = 1;
//                  EXRDecoder.blockHeight = 1;
                    EXRDecoder.uncompress = uncompressRLE;
//                  EXRDecoder.uncompress = uncompressRLE;
                    break;
//                  break;

                case "ZIPS_COMPRESSION":
//              case "ZIPS_COMPRESSION":
                    EXRDecoder.blockHeight = 1;
//                  EXRDecoder.blockHeight = 1;
                    EXRDecoder.uncompress = uncompressZIP;
//                  EXRDecoder.uncompress = uncompressZIP;
                    break;
//                  break;

                case "ZIP_COMPRESSION":
//              case "ZIP_COMPRESSION":
                    EXRDecoder.blockHeight = 16;
//                  EXRDecoder.blockHeight = 16;
                    EXRDecoder.uncompress = uncompressZIP;
//                  EXRDecoder.uncompress = uncompressZIP;
                    break;
//                  break;

                case "PIZ_COMPRESSION":
//              case "PIZ_COMPRESSION":
                    EXRDecoder.blockHeight = 32;
//                  EXRDecoder.blockHeight = 32;
                    EXRDecoder.uncompress = uncompressPIZ;
//                  EXRDecoder.uncompress = uncompressPIZ;
                    break;
//                  break;

                case "PXR24_COMPRESSION":
//              case "PXR24_COMPRESSION":
                    EXRDecoder.blockHeight = 16;
//                  EXRDecoder.blockHeight = 16;
                    EXRDecoder.uncompress = uncompressPXR;
//                  EXRDecoder.uncompress = uncompressPXR;
                    break;
//                  break;

                case "DWAA_COMPRESSION":
//              case "DWAA_COMPRESSION":
                    EXRDecoder.blockHeight = 32;
//                  EXRDecoder.blockHeight = 32;
                    EXRDecoder.uncompress = uncompressDWA;
//                  EXRDecoder.uncompress = uncompressDWA;
                    break;
//                  break;

                case "DWAB_COMPRESSION":
//              case "DWAB_COMPRESSION":
                    EXRDecoder.blockHeight = 256;
//                  EXRDecoder.blockHeight = 256;
                    EXRDecoder.uncompress = uncompressDWA;
//                  EXRDecoder.uncompress = uncompressDWA;
                    break;
//                  break;

                default:
//              default:
                    throw new Error(
//                  throw new Error(
                        "EXRLoader.parse: " + EXRHeader.compression + " is unsupported",
//                      "EXRLoader.parse: " + EXRHeader.compression + " is unsupported",
                    );
//                  );
            }
//          }

            const channels = {};
//          const channels = {};
            for (const channel of EXRHeader.channels) {
//          for (const channel of EXRHeader.channels) {
                switch (channel.name) {
//              switch (channel.name) {
                    case "Y":
//                  case "Y":
                    case "R":
//                  case "R":
                    case "G":
//                  case "G":
                    case "B":
//                  case "B":
                    case "A":
//                  case "A":
                        channels[channel.name] = true;
//                      channels[channel.name] = true;
                        EXRDecoder.type = channel.pixelType;
//                      EXRDecoder.type = channel.pixelType;
                }
//              }
            }
//          }

            //  RGB images will be converted to RGBA format, preventing software emulation in select devices.
            //  RGB images will be converted to RGBA format, preventing software emulation in select devices.
            let fillAlpha = false;
//          let fillAlpha = false;

            if (channels.R && channels.G && channels.B) {
//          if (channels.R && channels.G && channels.B) {
                fillAlpha = !channels.A;
//              fillAlpha = !channels.A;
                EXRDecoder.outputChannels = 4;
//              EXRDecoder.outputChannels = 4;
                EXRDecoder.decodeChannels = { R: 0, G: 1, B: 2, A: 3 };
//              EXRDecoder.decodeChannels = { R: 0, G: 1, B: 2, A: 3 };
            } else if (channels.Y) {
//          } else if (channels.Y) {
                EXRDecoder.outputChannels = 1;
//              EXRDecoder.outputChannels = 1;
                EXRDecoder.decodeChannels = { Y: 0 };
//              EXRDecoder.decodeChannels = { Y: 0 };
            } else {
//          } else {
                throw new Error(
//              throw new Error(
                    "EXRLoader.parse: file contains unsupported data channels.",
//                  "EXRLoader.parse: file contains unsupported data channels.",
                );
//              );
            }
//          }

            if (EXRDecoder.type == 1) {
//          if (EXRDecoder.type == 1) {
                //  half
                //  half
                switch (outputType) {
//              switch (outputType) {
                    case FloatType:
//                  case FloatType:
                        EXRDecoder.getter = parseFloat16;
//                      EXRDecoder.getter = parseFloat16;
                        break;
//                      break;

                    case HalfFloatType:
//                  case HalfFloatType:
                        EXRDecoder.getter = parseUint16;
//                      EXRDecoder.getter = parseUint16;
                        break;
//                      break;
                }
//              }
            } else if (EXRDecoder.type == 2) {
//          } else if (EXRDecoder.type == 2) {
                //  float
                //  float
                switch (outputType) {
//              switch (outputType) {
                    case FloatType:
//                  case FloatType:
                        EXRDecoder.getter = parseFloat32;
//                      EXRDecoder.getter = parseFloat32;
                        break;
//                      break;

                    case HalfFloatType:
//                  case HalfFloatType:
                        EXRDecoder.getter = decodeFloat32;
//                      EXRDecoder.getter = decodeFloat32;
                }
//              }
            } else {
//          } else {
                throw new Error(
//              throw new Error(
                    "EXRLoader.parse: unsupported pixelType " +
//                  "EXRLoader.parse: unsupported pixelType " +
                    EXRDecoder.type +
//                  EXRDecoder.type +
                    " for " +
//                  " for " +
                    EXRHeader.compression +
//                  EXRHeader.compression +
                    ".",
//                  ".",
                );
//              );
            }
//          }

            EXRDecoder.columns = EXRDecoder.width;
//          EXRDecoder.columns = EXRDecoder.width;
            const size =
//          const size =
                EXRDecoder.width * EXRDecoder.height * EXRDecoder.outputChannels;
//              EXRDecoder.width * EXRDecoder.height * EXRDecoder.outputChannels;

            switch (outputType) {
//          switch (outputType) {
                case FloatType:
//              case FloatType:
                    EXRDecoder.byteArray = new Float32Array(size);
//                  EXRDecoder.byteArray = new Float32Array(size);

                    //  Fill initially with 1s for the alpha value if the texture is not RGBA, RGB values will be overwritten
                    //  Fill initially with 1s for the alpha value if the texture is not RGBA, RGB values will be overwritten
                    if (fillAlpha) EXRDecoder.byteArray.fill(1, 0, size);
//                  if (fillAlpha) EXRDecoder.byteArray.fill(1, 0, size);

                    break;
//                  break;

                case HalfFloatType:
//              case HalfFloatType:
                    EXRDecoder.byteArray = new Uint16Array(size);
//                  EXRDecoder.byteArray = new Uint16Array(size);

                    if (fillAlpha) EXRDecoder.byteArray.fill(0x3c00, 0, size); // Uint16Array holds half float data, 0x3C00 is 1
//                  if (fillAlpha) EXRDecoder.byteArray.fill(0x3c00, 0, size); // Uint16Array holds half float data, 0x3C00 is 1

                    break;
//                  break;

                default:
//              default:
                    console.error("EXRLoader: unsupported type: ", outputType);
//                  console.error("EXRLoader: unsupported type: ", outputType);
                    break;
//                  break;
            }
//          }

            let byteOffset = 0;
//          let byteOffset = 0;
            for (const channel of EXRHeader.channels) {
//          for (const channel of EXRHeader.channels) {
                if (EXRDecoder.decodeChannels[channel.name] !== undefined) {
//              if (EXRDecoder.decodeChannels[channel.name] !== undefined) {
                    EXRDecoder.channelByteOffsets[channel.name] = byteOffset;
//                  EXRDecoder.channelByteOffsets[channel.name] = byteOffset;
                }
//              }

                byteOffset += channel.pixelType * 2;
//              byteOffset += channel.pixelType * 2;
            }
//          }

            EXRDecoder.totalBytes = byteOffset;
//          EXRDecoder.totalBytes = byteOffset;
            EXRDecoder.outLineWidth = EXRDecoder.width * EXRDecoder.outputChannels;
//          EXRDecoder.outLineWidth = EXRDecoder.width * EXRDecoder.outputChannels;

            if (EXRHeader.lineOrder === "INCREASING_Y") {
//          if (EXRHeader.lineOrder === "INCREASING_Y") {
                EXRDecoder.scanOrder = (y) => y;
//              EXRDecoder.scanOrder = (y) => y;
            } else {
//          } else {
                EXRDecoder.scanOrder = (y) => EXRDecoder.height - 1 - y;
//              EXRDecoder.scanOrder = (y) => EXRDecoder.height - 1 - y;
            }
//          }

            if (EXRDecoder.outputChannels == 4) {
//          if (EXRDecoder.outputChannels == 4) {
                EXRDecoder.format = RGBAFormat;
//              EXRDecoder.format = RGBAFormat;
                EXRDecoder.colorSpace = LinearSRGBColorSpace;
//              EXRDecoder.colorSpace = LinearSRGBColorSpace;
            } else {
//          } else {
                EXRDecoder.format = RedFormat;
//              EXRDecoder.format = RedFormat;
                EXRDecoder.colorSpace = NoColorSpace;
//              EXRDecoder.colorSpace = NoColorSpace;
            }
//          }

            if (EXRHeader.spec.singleTile) {
//          if (EXRHeader.spec.singleTile) {
                EXRDecoder.blockHeight = EXRHeader.tiles.ySize;
//              EXRDecoder.blockHeight = EXRHeader.tiles.ySize;
                EXRDecoder.blockWidth = EXRHeader.tiles.xSize;
//              EXRDecoder.blockWidth = EXRHeader.tiles.xSize;

                const numXLevels = calculateTileLevels(
//              const numXLevels = calculateTileLevels(
                    EXRHeader.tiles,
//                  EXRHeader.tiles,
                    EXRDecoder.width,
//                  EXRDecoder.width,
                    EXRDecoder.height,
//                  EXRDecoder.height,
                );
//              );
                //  const numYLevels = calculateTileLevels( EXRHeader.tiles, EXRDecoder.width, EXRDecoder.height );
                //  const numYLevels = calculateTileLevels( EXRHeader.tiles, EXRDecoder.width, EXRDecoder.height );

                const numXTiles = calculateTiles(
//              const numXTiles = calculateTiles(
                    numXLevels,
//                  numXLevels,
                    EXRDecoder.width,
//                  EXRDecoder.width,
                    EXRHeader.tiles.xSize,
//                  EXRHeader.tiles.xSize,
                    EXRHeader.tiles.roundingMode,
//                  EXRHeader.tiles.roundingMode,
                );
//              );
                const numYTiles = calculateTiles(
//              const numYTiles = calculateTiles(
                    numXLevels,
//                  numXLevels,
                    EXRDecoder.height,
//                  EXRDecoder.height,
                    EXRHeader.tiles.ySize,
//                  EXRHeader.tiles.ySize,
                    EXRHeader.tiles.roundingMode,
//                  EXRHeader.tiles.roundingMode,
                );
//              );

                EXRDecoder.tileCount = numXTiles[0] * numYTiles[0];
//              EXRDecoder.tileCount = numXTiles[0] * numYTiles[0];

                for (let l = 0; l < numXLevels; l++)
//              for (let l = 0; l < numXLevels; l++)
                    for (let y = 0; y < numYTiles[l]; y++)
//                  for (let y = 0; y < numYTiles[l]; y++)
                        for (let x = 0; x < numXTiles[l]; x++) parseInt64(dataView, offset); // tileOffset
//                      for (let x = 0; x < numXTiles[l]; x++) parseInt64(dataView, offset); // tileOffset

                EXRDecoder.decode = parseTiles.bind(EXRDecoder);
//              EXRDecoder.decode = parseTiles.bind(EXRDecoder);
            } else {
//          } else {
                EXRDecoder.blockWidth = EXRDecoder.width;
//              EXRDecoder.blockWidth = EXRDecoder.width;
                const blockCount = Math.ceil(EXRDecoder.height / EXRDecoder.blockHeight);
//              const blockCount = Math.ceil(EXRDecoder.height / EXRDecoder.blockHeight);

                for (let i = 0; i < blockCount; i++) parseInt64(dataView, offset); // scanlineOffset
//              for (let i = 0; i < blockCount; i++) parseInt64(dataView, offset); // scanlineOffset

                EXRDecoder.decode = parseScanline.bind(EXRDecoder);
//              EXRDecoder.decode = parseScanline.bind(EXRDecoder);
            }
//          }

            return EXRDecoder;
//          return EXRDecoder;
        }
//      }

        //  start parsing file [START]
        //  start parsing file [START]
        const offset = { value: 0 };
//      const offset = { value: 0 };
        const bufferDataView = new DataView(buffer);
//      const bufferDataView = new DataView(buffer);
        const uInt8Array = new Uint8Array(buffer);
//      const uInt8Array = new Uint8Array(buffer);

        //  get header information and validate format.
        //  get header information and validate format.
        const EXRHeader = parseHeader(bufferDataView, buffer, offset);
//      const EXRHeader = parseHeader(bufferDataView, buffer, offset);

        //  get input compression information and prepare decoding.
        //  get input compression information and prepare decoding.
        const EXRDecoder = setupDecoder(
//      const EXRDecoder = setupDecoder(
            EXRHeader,
//          EXRHeader,
            bufferDataView,
//          bufferDataView,
            uInt8Array,
//          uInt8Array,
            offset,
//          offset,
            type,
//          type,
        );
//      );

        //  parse input data
        //  parse input data
        EXRDecoder.decode(EXRDecoder);
//      EXRDecoder.decode(EXRDecoder);

        return {
//      return {
            header: EXRHeader,
//          header: EXRHeader,
            width: EXRDecoder.width,
//          width: EXRDecoder.width,
            height: EXRDecoder.height,
//          height: EXRDecoder.height,
            data: EXRDecoder.byteArray,
//          data: EXRDecoder.byteArray,
            format: EXRDecoder.format,
//          format: EXRDecoder.format,
            colorSpace: EXRDecoder.colorSpace,
//          colorSpace: EXRDecoder.colorSpace,
        };
//      };
    }
//  }
//  ```
//  ```
