import { ApGroupRadioParams24G }    from './ApGroupRadioParams24G'
import { ApGroupRadioParams50G }    from './ApGroupRadioParams50G'
import { ApGroupRadioParams6G }     from './ApGroupRadioParams6G'
import { ApGroupRadioParamsDual5G } from './ApGroupRadioParamsDual5G'

export class ApGroupQueryRadioCustomization {
  apGroupRadioParamsDual5G?: ApGroupRadioParamsDual5G

  apGroupRadioParams24G?: ApGroupRadioParams24G

  apGroupRadioParams50G?: ApGroupRadioParams50G

  apGroupRadioParams6G?: ApGroupRadioParams6G

  constructor () {
    this.apGroupRadioParamsDual5G = new ApGroupRadioParamsDual5G()

    this.apGroupRadioParams24G = new ApGroupRadioParams24G()

    this.apGroupRadioParams50G = new ApGroupRadioParams50G()

    this.apGroupRadioParams6G = new ApGroupRadioParams6G()
  }
}
