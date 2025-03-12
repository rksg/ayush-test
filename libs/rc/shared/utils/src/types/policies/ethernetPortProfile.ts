import { Radius }                                                             from '../../models'
import { EthernetPortAuthType, EthernetPortSupplicantType, EthernetPortType } from '../../models/EthernetPortProfileEnum'
import { APLanPortSettings }                                                  from '../ap'

import { ProfileLanApActivations, ProfileLanVenueActivations } from './common'

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
    venueActivations?: ProfileLanVenueActivations[]
    apActivations?: ProfileLanApActivations[]
    apPortOverwrites?: APLanPortSettings[]
    vni?: number
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
    venueActivations?: ProfileLanVenueActivations[]
  }

export interface EthernetPortProfileFormType extends EthernetPortProfile {
    authEnabled?: boolean
    authTypeRole?: EthernetPortAuthType
    authRadius?: Radius
    accountingRadius?: Radius
    accountingEnabled?: boolean
  }


export interface EthernetPortSupplicantOptions {
  type: EthernetPortSupplicantType
  username?: string
  password?: string
}