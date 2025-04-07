import { Params } from 'react-router-dom'
export * from './RTKQuery'

export type TimeStamp = string | number
export type TimeStampRange = [TimeStamp, TimeStamp]

export type TimelineStatus = 'PENDING' | 'INPROGRESS' | 'SUCCESS' | 'FAIL'

export interface StatusIconProps { status: TimelineStatus, description?: string }

export enum RolesEnum {
  PRIME_ADMIN = 'PRIME_ADMIN',
  ADMINISTRATOR = 'ADMIN',
  GUEST_MANAGER = 'OFFICE_ADMIN',
  READ_ONLY = 'READ_ONLY',
  DPSK_ADMIN = 'DPSK_ADMIN',
  TEMPLATES_ADMIN= 'TEMPLATES_ADMIN',
  REPORTS_ADMIN='REPORTS_ADMIN'
}

export const SupportedDelegatedRoles = [
  RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR,
  RolesEnum.GUEST_MANAGER, RolesEnum.READ_ONLY]

export interface RequestPayload <Payload = unknown> extends Record<string,unknown> {
  params?: Params<string>
  payload?: Payload
  customHeaders?: Record<string,unknown>
  enableRbac?: boolean
  oldPayload?: Payload
}

// Needed for Browser language detection
export const browserSupportedLocales: Record<string, string> = {
  'en-US': 'en-US',
  'en': 'en-US',
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'ja': 'ja-JP',
  'ja-JP': 'ja-JP',
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'ko': 'ko-KR',
  'ko-KR': 'ko-KR',
  'pt': 'pt-BR',
  'pt-BR': 'pt-BR',
  'de': 'de-DE',
  'de-DE': 'de-DE',
  'zh': 'zh-TW',
  'zh-TW': 'zh-TW'
}

export enum WifiScopes {
  READ = 'wifi-r',
  CREATE = 'wifi-c',
  UPDATE = 'wifi-u',
  DELETE = 'wifi-d'
}

export enum SwitchScopes {
  READ = 'switch-r',
  CREATE = 'switch-c',
  UPDATE = 'switch-u',
  DELETE = 'switch-d'
}

export enum EdgeScopes {
  READ = 'edge-r',
  CREATE = 'edge-c',
  UPDATE = 'edge-u',
  DELETE = 'edge-d'
}
// eslint-disable-next-line max-len
export type ScopeKeys = (WifiScopes|SwitchScopes|EdgeScopes|string|(WifiScopes|SwitchScopes|EdgeScopes|string)[])[]

export type RbacOpsIds = (string | string[])[]

export interface ITimeZone {
  dstOffset: number
  rawOffset: number
  timeZoneId: string
  timeZoneName: string
}

export interface NetworkVenueScheduler {
  sun?: string
  mon?: string
  tue?: string
  wed?: string
  thu?: string
  fri?: string
  sat?: string
}

export interface Scheduler extends Record<string, string[]> {}

