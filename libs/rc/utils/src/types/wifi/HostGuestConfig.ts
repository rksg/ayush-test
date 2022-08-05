export class HostGuestConfig {
  // List of domains (e.g. ruckuswireless.com) that is used to validate the email of the host
  hostDomains: string[]

  // List of choices of guest access duration for host to select from, Measured in hours. If set to 0, the duration is indefinite
  hostDurationChoices: number[]

  constructor () {
    //@Size(  min = 1  )
    this.hostDomains = []

    //@Size(  min = 1  , max = 5 )
    this.hostDurationChoices = []
  }
}
