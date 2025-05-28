import { ApRadioParams50GV1Dot1 } from './ApRadioParams50GV1Dot1'

export class ApRadioParamsDual5GV1Dot1 {
  enabled?: boolean

  useVenueOrApGroupEnabled?: boolean

  // True if lower 5 GHz is enabled
  lower5gEnabled?: boolean

  // True if upper 5 GHz is enabled
  upper5gEnabled?: boolean

  radioParamsLower5G?: ApRadioParams50GV1Dot1

  radioParamsUpper5G?: ApRadioParams50GV1Dot1

  constructor () {
    this.enabled = true

    this.useVenueOrApGroupEnabled = true

    this.lower5gEnabled = false

    this.upper5gEnabled = false

    this.radioParamsLower5G = new ApRadioParams50GV1Dot1()

    this.radioParamsUpper5G = new ApRadioParams50GV1Dot1()
  }
}
