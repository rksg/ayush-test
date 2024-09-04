export class FastRoamingOptions {
  statisticsOverDistributedSystemEnabled?: boolean
  reassociationTimeout?: number

  constructor () {
    this.statisticsOverDistributedSystemEnabled = false
    this.reassociationTimeout = 20
  }

}