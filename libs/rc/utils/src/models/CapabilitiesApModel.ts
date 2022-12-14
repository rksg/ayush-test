import { CapabilitiesLanPort } from './CapabilitiesLanPort'
import { ExternalAntenna }     from './ExternalAntenna'

export class CapabilitiesApModel {
  // External antenna default setting (read-only)

  externalAntenna?: ExternalAntenna

  model?: string

  lanPorts?: CapabilitiesLanPort[]

  allowDfsCountry?: string[]

  allowCbandCountry?: string[]

  lldpEnable?: boolean | null

  lldpAdInterval: number | null

  lldpHoldTime: number | null

  lldpMgmtEnable?: boolean | null

  ledOn?: boolean | null

  isOutdoor?: boolean | null

  has160MHzChannelBandwidth?: boolean | null

  canSupportPoeOut?: boolean | null

  canSupportPoeMode?: boolean | null

  canSupportLacp?: boolean | null

  requireOneEnabledTrunkPort?: boolean | null

  poeModeCapabilities?: string[]

  lanPortPictureDownloadUrl?: string

  pictureDownloadUrl?: string

  canSupportCellular?: boolean

  simCardPrimaryEnabled?: boolean

  simCardPrimaryApn?: string

  simCardPrimaryRoaming?: boolean

  simCardPrimaryCellularNetworkSelection?: string

  simCardSecondaryEnabled?: boolean

  simCardSecondaryApn?: string

  simCardSecondaryRoaming?: boolean

  simCardSecondaryCellularNetworkSelection?: string

  wanConnection?: string

  primaryWanRecoveryTimer?: number

  capabilityScore?: number

  supportTriRadio?: boolean

  supportDual5gMode?: boolean

  supportChannel144?: boolean

  support11AX?: boolean

  constructor () {
    this.externalAntenna = new ExternalAntenna()

    this.lanPorts = []

    this.allowDfsCountry = []

    this.allowCbandCountry = []

    this.lldpEnable = null

    this.lldpAdInterval = null

    this.lldpHoldTime = null

    this.lldpMgmtEnable = null

    this.ledOn = null

    this.isOutdoor = null

    this.has160MHzChannelBandwidth = null

    this.canSupportPoeOut = null

    this.canSupportPoeMode = null

    this.canSupportLacp = null

    this.requireOneEnabledTrunkPort = null

    this.poeModeCapabilities = []

    this.canSupportCellular = false

    this.simCardPrimaryEnabled = true

    this.simCardPrimaryRoaming = true

    this.simCardSecondaryEnabled = true

    this.simCardSecondaryRoaming = true

    this.supportTriRadio = false

    this.supportDual5gMode = false

    this.supportChannel144 = false

    this.support11AX = false
  }
}
