export class QosMapSetRules {
  enabled: boolean
  priority: number
  dscpLow: number
  dscpHigh: number
  dscpExceptionValues: number[]

  constructor () {
    this.enabled = true
    this.priority = 0
    this.dscpLow = 0
    this.dscpHigh = 7
    this.dscpExceptionValues = []
  }
}

export class QosMapSetOptions {
  rules?: Array<QosMapSetRules>

  constructor () {
    this.rules = []
  }
}