import { 
  RfBandUsageEnum,
  BssMinimumPhyRateEnum,
  BssMinimumPhyRateEnum6G,
  PhyTypeConstraintEnum,
  ManagementFrameMinimumPhyRateEnum,
  ManagementFrameMinimumPhyRateEnum6G
} from '../contents'

export class WlanRadioCustomization {
  rfBandUsage: RfBandUsageEnum

  // BSS (basic service set) minimum PHY rate
  bssMinimumPhyRate: BssMinimumPhyRateEnum

  // BSS (basic service set) minimum PHY rate for radio 6G
  bssMinimumPhyRate6G: BssMinimumPhyRateEnum6G

  // OFDM improves network performance but prevents 802.11b devices from connecting to the network.
  phyTypeConstraint: PhyTypeConstraintEnum

  // Management Frame Minimum PHY Rate
  managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum

  // Management Frame Minimum PHY Rate for radio 6G
  managementFrameMinimumPhyRate6G: ManagementFrameMinimumPhyRateEnum6G

  constructor () {
    this.rfBandUsage = RfBandUsageEnum.BOTH

    this.bssMinimumPhyRate = BssMinimumPhyRateEnum._default

    this.bssMinimumPhyRate6G = BssMinimumPhyRateEnum6G._6

    this.phyTypeConstraint = PhyTypeConstraintEnum.OFDM

    this.managementFrameMinimumPhyRate = ManagementFrameMinimumPhyRateEnum._6

    this.managementFrameMinimumPhyRate6G =
      ManagementFrameMinimumPhyRateEnum6G._6
  }
}
