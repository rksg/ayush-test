export interface Ipv4Format {
  addressDotQuad: string;
  netmaskBits: number;
  addressInteger: number;
  addressBinStr: string;
  netmaskBinStr: string;
  netmaskInteger: number;
  netmaskDotQuad: string;
  netaddressBinStr: string;
  netaddressInteger: number;
  netaddressDotQuad: string;
  netbcastBinStr: string;
  netbcastInteger: number;
  netbcastDotQuad: string;
}

export class IpCalculatorUtilsService {
  Ipv4Address (addressDotQuad: string, netmaskBits: number) {
    const ip: Ipv4Format = {
      addressDotQuad: '',
      netmaskBits: 0,
      addressInteger: 0,
      addressBinStr: '',
      netmaskBinStr: '',
      netmaskInteger: 0,
      netmaskDotQuad: '',
      netaddressBinStr: '',
      netaddressInteger: 0,
      netaddressDotQuad: '',
      netbcastBinStr: '',
      netbcastInteger: 0,
      netbcastDotQuad: ''
    }
    const split = addressDotQuad.split('.', 4)
    let byte1 = Math.max(0, Math.min(255, parseInt(split[0], 10))) /* sanity check: valid values: = 0-255 */
    let byte2 = Math.max(0, Math.min(255, parseInt(split[1], 10)))
    let byte3 = Math.max(0, Math.min(255, parseInt(split[2], 10)))
    let byte4 = Math.max(0, Math.min(255, parseInt(split[3], 10)))

    if (isNaN(byte1)) {
      byte1 = 0
    } /* fix NaN situations */
    if (isNaN(byte2)) {
      byte2 = 0
    }
    if (isNaN(byte3)) {
      byte3 = 0
    }
    if (isNaN(byte4)) {
      byte4 = 0
    }
    addressDotQuad = (byte1 + '.' + byte2 + '.' + byte3 + '.' + byte4)
    ip.addressDotQuad = addressDotQuad.toString()
    ip.netmaskBits = Math.max(0, Math.min(32, netmaskBits)) /* sanity check: valid values: = 0-32 */
    ip.addressInteger = this.Ipv4DotquadAToIntA(ip.addressDotQuad)
    ip.addressBinStr = this.Ipv4IntAToBinstrA(ip.addressInteger)
    ip.netmaskBinStr = this.Ipv4BitsNMToBinstrNM(ip.netmaskBits)
    ip.netmaskInteger = this.Ipv4BinstrAToIntA(ip.netmaskBinStr)
    ip.netmaskDotQuad = this.Ipv4IntAToDotquadA(ip.netmaskInteger)
    ip.netaddressBinStr = this.Ipv4CalcNetaddrBinStr(ip.addressBinStr, ip.netmaskBinStr)
    ip.netaddressInteger = this.Ipv4BinstrAToIntA(ip.netaddressBinStr)
    ip.netaddressDotQuad = this.Ipv4IntAToDotquadA(ip.netaddressInteger)
    ip.netbcastBinStr = this.Ipv4CalcNetbcastBinStr(ip.addressBinStr, ip.netmaskBinStr)
    ip.netbcastInteger = this.Ipv4BinstrAToIntA(ip.netbcastBinStr)
    ip.netbcastDotQuad = this.Ipv4IntAToDotquadA(ip.netbcastInteger)
    return ip
  }

  private Ipv4DotquadAToIntA (strbits: string) {
    const split = strbits.split('.', 4).map((item) => parseInt(item, 10))
    const myInt = (parseFloat((split[0] * 16777216).toString()) /* 2^24 */
      + parseFloat((split[1] * 65536).toString()) /* 2^16 */
      + parseFloat((split[2] * 256).toString()) /* 2^8  */
      + split[3])
    return myInt
  }

  /* integer IP to dotted-quad */
  private Ipv4IntAToDotquadA (strnum: number) {
    const byte1 = (strnum >>> 24)
    const byte2 = (strnum >>> 16) & 255
    const byte3 = (strnum >>> 8) & 255
    const byte4 = strnum & 255
    return (byte1 + '.' + byte2 + '.' + byte3 + '.' + byte4)
  }

  /* integer IP to binary string representation */
  private Ipv4IntAToBinstrA (strnum: number) {
    let numStr = strnum.toString(2) /* Initialize return value as string */
    const numZeros = 32 - numStr.length /* Calculate no. of zeros */
    if (numZeros > 0) {
      for (let i = 1; i <= numZeros; i++) {
        numStr = '0' + numStr
      }
    }
    return numStr
  }

  /* binary string IP to integer representation */
  private Ipv4BinstrAToIntA (binstr: string) {
    return parseInt(binstr, 2)
  }

  /* convert # of bits to a string representation of the binary value */
  private Ipv4BitsNMToBinstrNM (bitsNM: number) {
    let bitString = ''
    let numberOfOnes = bitsNM
    while (numberOfOnes--)
      bitString += '1' /* fill in ones */
    let numberOfZeros = 32 - bitsNM
    while (numberOfZeros--)
      bitString += '0' /* pad remaining with zeros */
    return bitString
  }

  /* The IPv4_Calc_* s operate on string representations of the binary value because I don't trust JavaScript's sign + 31-bit bitwise s. */
  /* logical AND between address & netmask */
  private Ipv4CalcNetaddrBinStr (addressBinStr: string, netmaskBinStr: string) {
    let netaddressBinStr = ''
    let aBit: number = 0
    let nmBit: number = 0
    for (let pos = 0; pos < 32; pos++) {
      aBit = parseInt(addressBinStr.substring(pos, 1), 10)
      nmBit = parseInt(netmaskBinStr.substring(pos, 1), 10)
      if (aBit === nmBit) {
        netaddressBinStr += aBit.toString()
      }
      else {
        netaddressBinStr += '0'
      }
    }
    return netaddressBinStr
  }

  /* logical OR between address & NOT netmask */
  private Ipv4CalcNetbcastBinStr (addressBinStr: string, netmaskBinStr: string) {
    let netbcastBinStr = ''
    let aBit = 0
    let nmBit = 0
    for (let pos = 0; pos < 32; pos++) {
      aBit = parseInt(addressBinStr.substring(pos, 1), 10)
      nmBit = parseInt(netmaskBinStr.substring(pos, 1), 10)
      if (nmBit) {
        nmBit = 0
      } /* flip netmask bits */
      else {
        nmBit = 1
      }
      if (aBit || nmBit) {
        netbcastBinStr += '1'
      }
      else {
        netbcastBinStr += '0'
      }
    }
    return netbcastBinStr
  }

  /* included as an example alternative for converting 8-bit bytes to an integer in Ipv4DotquadAToIntA */
  Ipv4BitShiftLeft (mask: number, bits: number) {
    return (mask * Math.pow(2, bits))
  }

  /* used for display purposes */
  Ipv4BinaryDotQuad (binaryString: string) {
    return (binaryString.substring(0, 8) + '.' +
      binaryString.substring(8, 8) + '.' +
      binaryString.substring(16, 8) + '.' +
      binaryString.substring(24, 8))
  }
}

// Adapted from http://www-personal.umich.edu/~parsec/information/code/ip_calc.html
/*
Copyright (c) 2010, Michael J. Skora
All rights reserved.
Source: http://www.umich.edu/~parsec/information/code/ip_calc.js.txt

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions of source code packaged with any other code to form a distributable product must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of the author or other identifiers used by the author (such as nickname or avatar) may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/