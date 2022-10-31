import { ApRadioParams50G } from './ApRadioParams50G'

export class ApRadioParamsDual5G {
  enabled?: boolean

  // True if lower 5 GHz is enabled

  lower5gEnabled?: boolean

  // True if upper 5 GHz is enabled

  upper5gEnabled?: boolean

  radioParamsLower5G: ApRadioParams50G

  radioParamsUpper5G: ApRadioParams50G

  constructor () {
    this.enabled = true

    this.lower5gEnabled = false

    this.upper5gEnabled = false

    this.radioParamsLower5G = new ApRadioParams50G()

    this.radioParamsUpper5G = new ApRadioParams50G()
  }
}
