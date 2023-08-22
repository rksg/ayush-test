import { Params } from 'react-router-dom'

import { LangKey } from '@acx-ui/utils'
export * from './RTKQuery'

export type TimeStamp = string | number
export type TimeStampRange = [TimeStamp, TimeStamp]

export type TimelineStatus = 'PENDING' | 'INPROGRESS' | 'SUCCESS' | 'FAIL'

export enum RolesEnum {
  PRIME_ADMIN = 'PRIME_ADMIN',
  ADMINISTRATOR = 'ADMIN',
  GUEST_MANAGER = 'OFFICE_ADMIN',
  READ_ONLY = 'READ_ONLY',
  DPSK_ADMIN = 'DPSK_ADMIN'
}

export interface RequestPayload <Payload = unknown> extends Record<string,unknown> {
  params?: Params<string>
  payload?: Payload
}

// Needed for Browser language detection
export const browserSupportedLocales: Record<string, LangKey> = {
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
  'pt-BR': 'pt-BR'
}
