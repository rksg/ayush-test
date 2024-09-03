import { ApLanPortTypeEnum, Radius }                        from '../../models'
import { EthernetPortAuthType, EthernetPortSupplicantType } from '../../models/EthernetPortProfileEnum'

export interface EthernetPortProfileViewData {
    id: string
    name: string
    isDefault: boolean
    type: ApLanPortTypeEnum
    untagId: number
    vlanMembers: string
    authType: EthernetPortAuthType
    authRadiusId: string
    accountingRadiusId?: string
    bypassMacAddressAuthentication?: boolean
    supplicantAuthenticationOption?: EthernetPortSupplicantType
    dynamicVlanEnabled?: boolean
    unauthenticatedguestVlan?: number
    enableAuthProxy?: boolean
    enableAccountingProxy?: boolean,
    apSerialNumbers: string[],
    venueIds: string[],
    venueActivations?: VenueActivation[],
    apActivations?: ApActivation[]
  }

export interface EthernetPortProfile {
    id: string
    name: string
    isDefault: boolean
    type: ApLanPortTypeEnum
    untagId: number
    vlanMembers: string
    authType: EthernetPortAuthType
    authRadiusId?: string
    accountingRadiusId?: string
    bypassMacAddressAuthentication?: boolean
    supplicantAuthenticationOption?: EthernetPortSupplicantType
    dynamicVlanEnabled?: boolean
    unauthenticatedguestVlan?: number
    enableAuthProxy?: boolean
    enableAccountingProxy?: boolean
  }

export interface EthernetPortProfileFormType extends EthernetPortProfile {
    authEnabled?: boolean
    authTypeRole?: EthernetPortAuthType
    authRadius?: Radius
    accountingRadius?: Radius
    accountingEnabled?: boolean
  }

export interface VenueActivation {
  venueId?: string
  apModel?: string
  portId?: number
}

export interface ApActivation {
  venueId?: string
  apSerialNumber?: string
  portId?: number
}