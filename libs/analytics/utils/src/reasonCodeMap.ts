import { defineMessage, IntlShape, MessageDescriptor } from 'react-intl'

import { ccd80211ReasonCodes } from './mapping/ccd80211ReasonCodeMap'
import { ccdFailureTypes }     from './mapping/ccdFailureTypeMap'
import { ccdReasonCodes }      from './mapping/ccdReasonCodeMap'
import { clientEvents }        from './mapping/clientEventsMap'

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

const attemptTitles = {
  ...readCodesIntoMap('attemptsText')(ccdFailureTypes as MapElement[]),
  ttc: defineMessage({ defaultMessage: 'Time To Connect Attempts' })
}

const ccdReasonCodeMap = readCodesIntoMap()(
  (ccdReasonCodes as MapElement[]).concat(
  ccd80211ReasonCodes.filter(({ code }) => !code.startsWith('SG_DHCP')) as MapElement[]))

const clientEventsMap = readCodesIntoMap()(clientEvents as MapElement[])

export function clientEventDescription (
  event: MapElement['code'],
  state?: string
) {
  if (!clientEventsMap.hasOwnProperty(event)) return ccdReasonCodeMap[event] || `${event}`
  const clientEventDescription = clientEventsMap[event as keyof typeof clientEventsMap]

  if (event !== 'EVENT_CLIENT_INFO_UPDATED') return clientEventDescription

  return state === 're-associate'
    ? defineMessage({ defaultMessage: 'Client (re)associated (802.11)' })
    : clientEventDescription
}

export function mapCodeToReason (code: string, intl: IntlShape) {
  const reason = failureTitles[code as keyof typeof failureTitles] || clientEventDescription(code)
  return (typeof reason === 'string') ? reason : intl.$t(reason)
}

export function mapCodeToAttempt (code: string, intl: IntlShape) {
  const reason = attemptTitles[code as keyof typeof attemptTitles] || clientEventDescription(code)
  return (typeof reason === 'string') ? reason : intl.$t(reason)
}
