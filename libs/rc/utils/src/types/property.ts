
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
  enableGuestDpsk: boolean
  personaGroupId?: string,
  residentPortalId?: string,
  unitConfiguration?: {
    residentPortalAllowed: boolean,
    useMaxUnitCount: boolean,
    maxUnitCount: number
  },
  communicationConfiguration?: {
    sendEmail: boolean,
    sendSms: boolean,
    unitAssignmentTemplateId?: string,
    passphraseChangeTemplateId?: string
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

interface PropertyDpskConfig {
  type: PropertyDpskType,
  // TODO: Check this field meaning
  status: 'CREATED' | 'ASSIGNED' | 'UNASSIGNED' | 'FAILED'
  passphrase: string,
  vlan?: number
}

export enum PropertyUnitStatus {
  ENABLED = 'ENABLED', DISABLED = 'DISABLED'
}

export interface PropertyUnit {
  id: string,
  name: string,
  dpsks: PropertyDpskConfig[],
  status: PropertyUnitStatus,
  resident?: {
    name?: string,
    email?: string,
    phoneNumber?: string
  },
  // FIXME: turn to required and move dpsks to here
  personaSettings?: {
    dpsks: PropertyDpskConfig[],
    accessPoint: {
      name: string,
      selectedPorts: {
        macAddress: string,
        portIndex: number
      }[]
    },
    vni: number,
    personaId: string,
    guestPersonaId: string
  }
}

export interface PropertyUnitFormFields extends PropertyUnit {
  dpskConfig: Omit<PropertyDpskConfig, 'type'>,
  guestDpskConfig: Omit<PropertyDpskConfig, 'type'>
}
