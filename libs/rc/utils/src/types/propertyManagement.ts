export interface Property {
  venueName: string
  personaGroupId: string
  residentPortalId: string
  status: PropertyStatus
  unitConfig: UnitConfig
  communicationConfig: CommunicationConfig
}

export enum PropertyStatus {
  DISABLED,
  ENABLED
}

export interface UnitConfig {
  type: string
  residentPortalAllowed: boolean
  useMaxUnitCount: boolean
  maxUnitCount: number
  guestAllowed: boolean
}

export interface CommunicationConfig {
  type: string
  sendEmail: boolean
  sendSms: boolean
  unitAssignmentHtmlRegId: string
  unitAssignmentTextRegId: string
  unitPassphraseChangeHtmlRegId: string
  unitPassphraseChangeTextRegId: string
  guestPassphraseChangeHtmlRegId: string
  guestPassphraseChangeTextRegId: string
  portalAccessResetHtmlRegId: string
  portalAccessResetTextRegId: string
  portAssignmentHtmlRegId: string
  portAssignmentTextRegId: string
}