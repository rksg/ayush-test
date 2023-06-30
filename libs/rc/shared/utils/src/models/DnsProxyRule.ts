export class DnsProxyRule {
  domainName: string

  ipList: string[]

  constructor () {
    this.domainName = ''

    this.ipList = []
  }
}
