
import moment from 'moment-timezone'

import { PersonaEthernetPort } from './persona'

// FIXME: remove unused interface
export enum PropertyManagerRoleEnum {
  PrimeAdministrator = 'Prime Administrator',
  Administrator = 'Administrator',
  PropertyManager = 'Property Manager'
}

export enum PropertyConfigStatus {
  ENABLED = 'ENABLED', DISABLED = 'DISABLED'
}

export enum ResidentPortalType {
  NO_PORTAL = 'NoPortal',
  RUCKUS_PORTAL = 'RuckusPortal',
  OWN_PORTAL = 'UseOwnPortal'
}

export interface PropertyConfigs {
  status: PropertyConfigStatus,
  personaGroupId?: string,
  residentPortalId?: string,
  venueId?: string,
  venueName?: string,
  residentPortalType?: ResidentPortalType, // only used in PropertyConfig setting form
  unitConfig?: {
    type: string,
    guestAllowed: boolean
    residentPortalAllowed: boolean,
    residentApiAllowed: boolean,
    useMaxUnitCount: boolean,
    maxUnitCount: number
  },
  communicationConfig?: {
    type: string,
    sendEmail: boolean,
    sendSms: boolean,
    unitAssignmentTemplateId?: string,
    passphraseChangeTemplateId?: string,
    unitAssignmentHtmlRegId?: string,
    unitAssignmentTextRegId?: string,
    unitPassphraseChangeHtmlRegId?: string,
    unitPassphraseChangeTextRegId?: string,
    guestPassphraseChangeHtmlRegId?: string,
    guestPassphraseChangeTextRegId?: string,
    portalAccessResetHtmlRegId?: string,
    portalAccessResetTextRegId?: string,
    portAssignmentHtmlRegId?: string
    portAssignmentTextRegId?: string
  },
}

export interface PropertyManager {
  name: string,
  role: PropertyManagerRoleEnum,
  email: string,
  phone: string
}

export enum PropertyDpskType {
  UNIT = 'UNIT',
  GUEST = 'GUEST'
}

export interface PropertyDpskSetting {
  type: PropertyDpskType,
  // TODO: Check this field meaning
  status?: 'CREATED' | 'ASSIGNED' | 'UNASSIGNED' | 'FAILED'
  passphrase?: string,
  vlan?: number
}

export enum PropertyUnitStatus {
  ENABLED = 'ENABLED', DISABLED = 'DISABLED'
}

export interface PropertyUnit {
  id: string,
  name: string,
  status: PropertyUnitStatus,
  resident?: {
    name?: string,
    email?: string,
    phoneNumber?: string
  },
  dpsks?: PropertyDpskSetting[],
  // FIXME: maybe can remove this and confirm PersonaId/GuestPersonaId would unwrap out of this
  personaId: string,
  guestPersonaId?: string,
  accessPoint?: {
    name?: string,
    selectedPorts: {
      macAddress: string,
      portIndex: number
    }[]
  },
  switch?: {
    name: string
  },
  vni?: number,
  _links?: {
    residentPortal?: {
      href?: string
    }
  },
  trafficControl?: {
    meteringProfileId: string,
    profileExpiry: string
  }
}

export interface UnitPersonaConfig {
  vlan?: number,
  dpskPassphrase?: string,
  ethernetPorts?: PersonaEthernetPort[], // FIXME: not integrate with Persona
  meteringProfileId?: string | null,
  expirationDate?: string | null
}

export interface PropertyUnitFormFields extends PropertyUnit {
  unitPersona?: UnitPersonaConfig,
  guestPersona?: UnitPersonaConfig,
  enableGuestVlan?: boolean,
  vxlan?: number,
  accessAp?: string,
  ports?: number[],
  apName?: string,
  meteringProfileId?: string | null,
  expirationDate?: moment.Moment
}

export interface ResidentPortal {
  id?: string,
  name: string,
  venueCount?: number,
  uiConfiguration?: uiConfiguration
}

interface uiConfiguration {
  type: 'uiConfiguration',
  text: {
    type?: 'text',
    title: string,
    subTitle: string,
    loginText: string,
    announcements: string,
    helpText: string
  },
  access?: {
    tenantSetDpsk: boolean
  },
  color?: {
    mainColor: string,
    accentColor: string,
    separatorColor: string,
    textColor: string
  },
  files?: {
    logoFileName?: string,
    favIconFileName?: string
  }
}

export interface PropertyConfigQuery {
  fields?: string[],
  filters?: Map<string, string | number>
  sortField?: string,
  sortOrder: string,
  page: number,
  pageSize: number
}
