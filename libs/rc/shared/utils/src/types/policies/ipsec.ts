import { DefaultOptionType }                from 'antd/lib/select'
import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  IpSecAuthEnum,
  IpSecProposalTypeEnum,
  IpSecEncryptionAlgorithmEnum,
  IpSecIntegrityAlgorithmEnum,
  IpSecPseudoRandomFunctionEnum,
  IpSecDhGroupEnum,
  IpSecAdvancedOptionEnum,
  IpSecRekeyTimeUnitEnum,
  IpSecFailoverModeEnum
} from '../../models'

import { ProfileLanApActivations, ProfileLanVenueActivations } from './common'

export interface Ipsec {
  id: string
  name: string
  serverAddress?: string
  authType: IpSecAuthEnum
  preSharedKey?: string
  certificate?: string
  ikeSecurityAssociation?: IkeSecurityAssociation
  espSecurityAssociation?: EspSecurityAssociation
  ikeRekeyTime?: number
  ikeRekeyTimeUnit?: IpSecRekeyTimeUnitEnum
  espRekeyTime?: number
  espRekeyTimeUnit?: IpSecRekeyTimeUnitEnum
  advancedOption?: AdvancedOption
}

export interface IkeSecurityAssociation {
  ikeProposalType: IpSecProposalTypeEnum
  ikeProposals: Array<IkeProposal>
}

export interface EspSecurityAssociation {
  espProposalType: IpSecProposalTypeEnum
  espProposals: Array<EspProposal>
}

export interface AdvancedOption {
  dhcpOpt43Subcode: number
  retryLimit: number
  replayWindow: number
  ipcompEnable: IpSecAdvancedOptionEnum
  enforceNatt: IpSecAdvancedOptionEnum
  dpdDelay: number
  keepAliveInterval: number
  failoverRetryPeriod: number
  failoverRetryInterval: number
  failoverMode: IpSecFailoverModeEnum
  failoverPrimaryCheckInterval: number
}

export interface IkeProposal {
  encAlg: IpSecEncryptionAlgorithmEnum
  authAlg: IpSecIntegrityAlgorithmEnum
  prfAlg: IpSecPseudoRandomFunctionEnum
  dhGroup: IpSecDhGroupEnum
}

export interface EspProposal {
  encAlg: IpSecEncryptionAlgorithmEnum
  authAlg: IpSecIntegrityAlgorithmEnum
  dhGroup: IpSecDhGroupEnum
}

export interface IpSecFormData extends Ipsec {
  ikeRekeyTimeEnabledCheckbox?: boolean
  espRekeyTimeEnabledCheckbox?: boolean
  retryLimitEnabledCheckbox?: boolean
  deadPeerDetectionDelayEnabledCheckbox?: boolean
  espReplayWindowEnabledCheckbox?: boolean
  nattKeepAliveIntervalEnabledCheckbox?: boolean
  failoverRetryPeriodIsForever?: boolean
}

export interface IpsecViewData {
  id: string
  name: string
  serverAddress: string
  authenticationType: IpSecAuthEnum
  preSharedKey: string
  certificate: string
  certNames: string[]
  ikeProposalType: string
  ikeProposals: IkeProposal[]
  espProposalType: string
  espProposals: EspProposal[]
  activations: IpsecActivation[]
  venueActivations: IpsecWiredActivation[]
  apActivations: IpsecWiredApActivation[]
}

export interface VenueTableUsageByIpsec extends IpsecActivation {
  name: string
  id: string
  addressLine: string
  wifiNetworkNames: string[]
  apSerialNumbers: string[]
  apNames: string[]
  softGreProfileId: string
  softGreProfileName: string
}

export interface VenueTableIpsecActivation {
  wifiNetworkIds: Set<string>
  apSerialNumbers: Set<string>
  softGreProfileId?: string
}

export interface IpsecActivation {
  venueId: string
  softGreProfileId?: string
  wifiNetworkIds: string[]
}

export interface IpsecWiredActivation extends ProfileLanVenueActivations {
  softGreProfileId: string
}

export interface IpsecWiredApActivation extends ProfileLanApActivations {
  softGreProfileId: string
}

export const authTypeLabelMapping: Record<IpSecAuthEnum, MessageDescriptor> = {
  [IpSecAuthEnum.PSK]: defineMessage({ defaultMessage: 'Pre-shared Key' }),
  [IpSecAuthEnum.CERTIFICATE]: defineMessage({ defaultMessage: 'Certificate' })
}


export interface IpSecOptionsData {
  options: DefaultOptionType[],
  id?: string,
  isLockedOptions: boolean,
  activationProfiles: string[],
  isLockedIpsec: boolean
}