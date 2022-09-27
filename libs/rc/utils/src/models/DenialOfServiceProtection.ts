export class DenialOfServiceProtection {
  enabled?: boolean
  
  // Time in seconds during which an AP drops (blocks) the client's authentication requests.
  blockingPeriod: number
  
  // The number of failed authentication requests within a check period which initiates a blocking action. 
  failThreshold: number
  
  // Time in seconds over which to measure a client's failed authentication attempts.
  checkPeriod: number
  
  constructor () {
    this.enabled = false
  
    this.blockingPeriod = 60
  
    this.failThreshold = 5
  
    this.checkPeriod = 30
  }
}
  