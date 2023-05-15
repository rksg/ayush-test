import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { disconnectReasonCodeMap } from './mapping/80211MgmtDeauthAndDisassociationFramesMap'
import { ccd80211ReasonCodes }     from './mapping/ccd80211ReasonCodeMap'
import { ccdFailureTypes }         from './mapping/ccdFailureTypeMap'
import { ccdReasonCodes }          from './mapping/ccdReasonCodeMap'
import { disconnectClientEvents }  from './mapping/clientDisconnectEventsMap'
import { clientEvents }            from './mapping/clientEventsMap'
import { ClientEventEnum }         from './types/clientEvent'

export type MapElement = {
  id: number
  code: string
  text: MessageDescriptor
} & Record<string, MessageDescriptor>

export const readCodesIntoMap = (
  columnName: keyof Omit<MapElement, 'id'|'code'> = 'text'
) => ( codeMapList: MapElement[]) => {
  return codeMapList.reduce((acc, codeMap) => {
    acc[codeMap.code] = codeMap[columnName]
    return acc
  }, {} as Record<string, MessageDescriptor>)
}

const failureTitles = {
  ...readCodesIntoMap('failuresText')(ccdFailureTypes as MapElement[]),
  ttc: defineMessage({ defaultMessage: 'Time To Connect' })
}

const failureCodeTextMap = {
  ...readCodesIntoMap('text')(ccdFailureTypes as MapElement[]),
  ttc: defineMessage({ defaultMessage: 'Time To Connect' })
}

const attemptTitles = {
  ...readCodesIntoMap('attemptsText')(ccdFailureTypes as MapElement[])
}

const ccdReasonCodeMap = readCodesIntoMap()(
  (ccdReasonCodes as MapElement[]).concat(
  ccd80211ReasonCodes.filter(({ code }) => !code.startsWith('SG_DHCP')) as MapElement[]))

const clientEventsMap = readCodesIntoMap()(
  clientEvents as MapElement[])
export const disconnectClientEventsMap = readCodesIntoMap()(
  disconnectClientEvents as MapElement[])
const disconnectDefaultReasonMap = readCodesIntoMap('reason')(
  disconnectClientEvents as MapElement[])

export function clientEventDescription (
  event: MapElement['code'],
  state?: string
) {
  if (!clientEventsMap.hasOwnProperty(event))
    return ccdReasonCodeMap[event] || `${event}`

  if (disconnectClientEventsMap.hasOwnProperty(event))
    return disconnectClientEventsMap[ClientEventEnum.DISCONNECT]

  if (event !== ClientEventEnum.INFO_UPDATED)
    return clientEventsMap[event as ClientEventEnum]

  return state === 're-associate'
    ? defineMessage({ defaultMessage: 'Client (re)associated (802.11)' })
    : clientEventsMap[event as ClientEventEnum]
}

export function mapCodeToReason (code: string, intl: IntlShape) {
  const reason = failureTitles[code as keyof typeof failureTitles] || clientEventDescription(code)
  return (typeof reason === 'string') ? reason : intl.$t(reason)
}

export function mapDisconnectCode (code: string | null): MessageDescriptor {
  return (code && disconnectClientEventsMap[code]) || defineMessage({ defaultMessage: 'Unknown' })
}

export function mapDisconnectCodeToReason (
  code: string | null, failedMsgId: string | null
): MessageDescriptor {
  return (failedMsgId && disconnectReasonCodeMap[failedMsgId])
    || (code && disconnectDefaultReasonMap[code])
    || defineMessage({ defaultMessage: 'Unknown' })
}

export function mapCodeToAttempt (code: string, intl: IntlShape) {
  const reason = attemptTitles[code as keyof typeof attemptTitles] || clientEventDescription(code)
  return (typeof reason === 'string') ? reason : intl.$t(reason)
}

export const mapCodeToFailureText = (code: string, intl: IntlShape) =>
  intl.$t(failureCodeTextMap[code as keyof typeof failureCodeTextMap])
