import { ApLanPort } from './ApLanPort'

export class ApLanPorts {
  poeOut?: boolean

  lanPorts?: ApLanPort[]

  // True if using Venue settings (overriding AP settings)

  useVenueSettings?: boolean

  constructor () {
    this.poeOut = false

    this.lanPorts = []

    this.useVenueSettings = false
  }
}
