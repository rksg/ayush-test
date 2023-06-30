export class ExternalAntenna {
  model: string
  // Enable 2.4 GHz external antenna

  enable24G?: boolean | null

  // Enable 5.0 GHz external antenna

  enable50G?: boolean | null

  // 2.4 GHz external antenna gain, in dBi

  gain24G: number | null

  // 5.0 GHz external antenna gain, in dBi

  gain50G: number | null

  // True if external antenna can be disabled

  supportDisable?: boolean | null

  // The 2.4 GHz and 5 GHz external antennas must be mutually enabled or disabled

  coupled?: boolean | null

  constructor () {
    this.model = ''

    this.enable24G = null

    this.enable50G = null

    this.gain24G = null

    this.gain50G = null

    this.supportDisable = null

    this.coupled = null
  }
}
