export class CapabilitiesLanPort {
  id?: string

  displayLabel?: string

  defaultType?: string

  untagId?: number

  vlanMembers?: string

  trunkPortOnly?: boolean | null

  supportDisable?: boolean | null

  isPoePort?: boolean | null

  isPoeOutPort?: boolean | null

  constructor () {
    this.trunkPortOnly = null

    this.supportDisable = null

    this.isPoePort = null

    this.isPoeOutPort = null
  }
}
