export class FastRoamingOptions {
  statisticsOverDistributedSystemEnabled?: boolean
  reassociationTimeout?: number

  constructor () {
    this.statisticsOverDistributedSystemEnabled = true
    this.reassociationTimeout = 20
  }

}