import { RadioParams24G }    from './RadioParams24G'
import { RadioParams50G }    from './RadioParams50G'
import { RadioParams6G }     from './RadioParams6G'
import { RadioParamsDual5G } from './RadioParamsDual5G'
  
export class VenueRadioCustomization {
  radioParamsDual5G: RadioParamsDual5G

  radioParams24G: RadioParams24G

  radioParams50G: RadioParams50G

  radioParams6G: RadioParams6G

  constructor () {
    this.radioParamsDual5G = new RadioParamsDual5G()
  
    this.radioParams24G = new RadioParams24G()
  
    this.radioParams50G = new RadioParams50G()
  
    this.radioParams6G = new RadioParams6G()
  }
}
  