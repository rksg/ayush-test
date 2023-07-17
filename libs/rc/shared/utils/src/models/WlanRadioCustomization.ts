import { BssMinimumPhyRateEnum }             from './BssMinimumPhyRateEnum'
import { ManagementFrameMinimumPhyRateEnum } from './ManagementFrameMinimumPhyRateEnum'
import { PhyTypeConstraintEnum }             from './PhyTypeConstraintEnum'
import { RfBandUsageEnum }                   from './RfBandUsageEnum'

export class WlanRadioCustomization {
  rfBandUsage: RfBandUsageEnum

  // BSS (basic service set) minimum PHY rate
  bssMinimumPhyRate: BssMinimumPhyRateEnum

  // OFDM improves network performance but prevents 802.11b devices from connecting to the network.
  phyTypeConstraint: PhyTypeConstraintEnum

  // Management Frame Minimum PHY Rate
  managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum

  constructor () {
    this.rfBandUsage = RfBandUsageEnum.BOTH

    this.bssMinimumPhyRate = BssMinimumPhyRateEnum._default

    this.phyTypeConstraint = PhyTypeConstraintEnum.OFDM

    this.managementFrameMinimumPhyRate = ManagementFrameMinimumPhyRateEnum._6
  }
}
