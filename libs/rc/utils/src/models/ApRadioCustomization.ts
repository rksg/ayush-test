import { ApRadioParams24G }    from './ApRadioParams24G'
import { ApRadioParams50G }    from './ApRadioParams50G'
import { ApRadioParams6G }     from './ApRadioParams6G'
import { ApRadioParamsDual5G } from './ApRadioParamsDual5G'

export class ApRadioCustomization {
  apRadioParams24G: ApRadioParams24G

  apRadioParams50G: ApRadioParams50G

  apRadioParamsDual5G: ApRadioParamsDual5G

  apRadioParams6G: ApRadioParams6G

  // True if 6 GHz is enabled

  enable6G?: boolean

  // True if using Venue settings (overriding AP settings)

  useVenueSettings?: boolean

  // True if 2.4 GHz is enabled

  enable24G?: boolean

  // True if 5 GHz is enabled

  enable50G?: boolean

  constructor () {
    this.apRadioParams24G = new ApRadioParams24G()

    this.apRadioParams50G = new ApRadioParams50G()

    this.apRadioParamsDual5G = new ApRadioParamsDual5G()

    this.apRadioParams6G = new ApRadioParams6G()

    this.enable6G = false

    this.useVenueSettings = true

    this.enable24G = false

    this.enable50G = false
  }
}
