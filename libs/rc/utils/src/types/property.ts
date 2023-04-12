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

export interface PropertyConfigs {
  status: PropertyConfigStatus,
  personaGroupId?: string,
  residentPortalId?: string,
  unitConfig?: {
    type: string,
    guestAllowed: boolean
    residentPortalAllowed: boolean,
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

interface PropertyDpskSetting {
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
  }
}

export interface UnitPersonaConfig {
  vlan?: number,
  dpskPassphrase?: string,
  ethernetPorts?: PersonaEthernetPort[] // FIXME: not integrate with Persona
}

export interface PropertyUnitFormFields extends PropertyUnit {
  unitPersona?: UnitPersonaConfig,
  guestPersona?: UnitPersonaConfig,
  accessAp?: string,
  ports?: number[],
  apName?: string
}

export interface ResidentPortal {
  id: string,
  name: string
}
