import { ApGroupRadioParams24G }    from './ApGroupRadioParams24G'
import { ApGroupRadioParams50G }    from './ApGroupRadioParams50G'
import { ApGroupRadioParams6G }     from './ApGroupRadioParams6G'
import { ApGroupRadioParamsDual5G } from './ApGroupRadioParamsDual5G'

export class ApGroupRadioCustomization {
  radioParamsDual5G?: ApGroupRadioParamsDual5G

  radioParams24G: ApGroupRadioParams24G

  radioParams50G: ApGroupRadioParams50G

  radioParams6G?: ApGroupRadioParams6G

  constructor () {
    this.radioParamsDual5G = new ApGroupRadioParamsDual5G()

    this.radioParams24G = new ApGroupRadioParams24G()

    this.radioParams50G = new ApGroupRadioParams50G()

    this.radioParams6G = new ApGroupRadioParams6G()
  }
}
