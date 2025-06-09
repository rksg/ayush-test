import { ApRadioParams24GV1Dot1 }    from './ApRadioParams24GV1Dot1'
import { ApRadioParams50GV1Dot1 }    from './ApRadioParams50GV1Dot1'
import { ApRadioParams6GV1Dot1 }     from './ApRadioParams6GV1Dot1'
import { ApRadioParamsDual5GV1Dot1 } from './ApRadioParamsDual5GV1Dot1'

export class ApRadioCustomizationV1Dot1 {
  apRadioParams24G: ApRadioParams24GV1Dot1

  apRadioParams50G?: ApRadioParams50GV1Dot1

  apRadioParamsDual5G?: ApRadioParamsDual5GV1Dot1

  apRadioParams6G?: ApRadioParams6GV1Dot1

  // True if 6 GHz is enabled
  enable6G?: boolean

  // True if 2.4 GHz is enabled
  enable24G?: boolean

  // True if 5 GHz is enabled
  enable50G?: boolean

  constructor () {
    this.apRadioParams24G = new ApRadioParams24GV1Dot1()

    this.apRadioParams50G = new ApRadioParams50GV1Dot1()

    this.apRadioParamsDual5G = new ApRadioParamsDual5GV1Dot1()

    this.apRadioParams6G = new ApRadioParams6GV1Dot1()

    this.enable6G = false

    this.enable24G = false

    this.enable50G = false
  }
}
