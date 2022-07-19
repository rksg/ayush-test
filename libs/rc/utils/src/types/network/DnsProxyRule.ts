export class DnsProxyRule {
  domainName: string

  ipList: string[]

  constructor () {
    this.domainName = ''

    //@Size(  min = 1  , max = 8 )
    this.ipList = []
  }
}
