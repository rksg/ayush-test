/**
 * *****************************************************************************************
 * ********************************* CodeGen Generated File ********************************
 * *****************************************************************************************
 */

import { X509Certificate } from './X509Certificate'

export class TrustedCAChain {
  rootCert: X509Certificate

  interCerts?: X509Certificate[]

  info?: string

  id?: string

  constructor () {
    this.rootCert = new X509Certificate()

    this.interCerts = []
  }
}
