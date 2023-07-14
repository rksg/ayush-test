import { RadiusOptions } from './RadiusOptions'


export class VenueRadiusOptions extends RadiusOptions {
  overrideEnabled: boolean

  constructor () {
    super()

    this.overrideEnabled = false
  }
}
