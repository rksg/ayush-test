import { RadioParams50G } from './RadioParams50G'

export class RadioParamsDual5G {
  enabled?: boolean

  inheritParamsLower5G?: boolean

  radioParamsLower5G: RadioParams50G

  inheritParamsUpper5G?: boolean

  radioParamsUpper5G: RadioParams50G

  constructor () {
    this.enabled = true

    this.inheritParamsLower5G = true

    this.radioParamsLower5G = new RadioParams50G()

    this.inheritParamsUpper5G = true

    this.radioParamsUpper5G = new RadioParams50G()
  }
}
