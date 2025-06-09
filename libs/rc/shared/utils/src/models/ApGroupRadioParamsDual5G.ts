import { ApGroupRadioParams50G } from './ApGroupRadioParams50G'

export class ApGroupRadioParamsDual5G {
  enabled?: boolean

  inheritParamsLower5G?: boolean

  radioParamsLower5G?: ApGroupRadioParams50G

  inheritParamsUpper5G?: boolean

  radioParamsUpper5G?: ApGroupRadioParams50G

  constructor () {
    this.enabled = true

    this.inheritParamsLower5G = true

    this.radioParamsLower5G = new ApGroupRadioParams50G()

    this.inheritParamsUpper5G = true

    this.radioParamsUpper5G = new ApGroupRadioParams50G()
  }
}
