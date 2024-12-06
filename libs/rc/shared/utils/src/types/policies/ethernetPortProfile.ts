import { Radius }                                                             from '../../models'
import { EthernetPortAuthType, EthernetPortSupplicantType, EthernetPortType } from '../../models/EthernetPortProfileEnum'

export interface EthernetPortProfileViewData {
    id: string
    name: string
    isDefault: boolean
    type: EthernetPortType
    untagId: number
    vlanMembers: string
    authType: EthernetPortAuthType
    authRadiusId: string
    accountingRadiusId?: string
    bypassMacAddressAuthentication?: boolean
    supplicantAuthenticationOptions?: EthernetPortSupplicantOptions
    dynamicVlanEnabled?: boolean
    unauthenticatedGuestVlan?: number
    enableAuthProxy?: boolean
    enableAccountingProxy?: boolean
    apSerialNumbers: string[]
    venueIds: string[]
    venueActivations?: VenueActivation[]
    apActivations?: ApActivation[]
    apPortOverwrites?: EthernetPortOverwrites[]
  }

export interface EthernetPortProfile {
    id: string
    name: string
    isDefault: boolean
    type: EthernetPortType
    untagId: number
    vlanMembers: string
    authType: EthernetPortAuthType
    authRadiusId?: string
    accountingRadiusId?: string
    bypassMacAddressAuthentication?: boolean
    supplicantAuthenticationOptions?: EthernetPortSupplicantOptions
    dynamicVlanEnabled?: boolean
    unauthenticatedGuestVlan?: number
    enableAuthProxy?: boolean
    enableAccountingProxy?: boolean
    apSerialNumbers?: string[]
    venueActivations?: VenueActivation[]
  }

export interface EthernetPortProfileFormType extends EthernetPortProfile {
    authEnabled?: boolean
    authTypeRole?: EthernetPortAuthType
    authRadius?: Radius
    accountingRadius?: Radius
    accountingEnabled?: boolean
  }

export interface EthernetPortOverwrites {
  portId?: number
  enabled?: boolean
  overwriteUntagId?: number
  overwriteVlanMembers?: string
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

export interface EthernetPortSupplicantOptions {
  type: EthernetPortSupplicantType
  username?: string
  password?: string
}