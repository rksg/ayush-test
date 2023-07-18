import { DnsProxyRule } from './DnsProxyRule'

export class DnsProxy {
  dnsProxyRules?: DnsProxyRule[]

  constructor () {
    //@Size(    max = 64 )
    this.dnsProxyRules = []
  }
}
