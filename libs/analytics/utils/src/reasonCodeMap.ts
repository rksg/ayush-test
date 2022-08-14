import { IntlShape, MessageDescriptor } from 'react-intl'

import { ccd80211ReasonCodes } from './mapping/ccd80211ReasonCodeMap'
import { ccdFailureTypes }     from './mapping/ccdFailureTypeMap'
import { ccdReasonCodes }      from './mapping/ccdReasonCodeMap'

interface MapElement {
  id: number
  code: number | string
  text: MessageDescriptor
}

export function readCodesIntoMap ( intl: IntlShape, codeMapList: MapElement[]) {
  return codeMapList.reduce((acc, codeMap) => {
    acc[codeMap.code] = intl.$t(codeMap.text)
    return acc
  }, {} as Record<number|string, string>)
}

export const getFailureLabels = (intl: IntlShape) => readCodesIntoMap(intl, ccdFailureTypes)

export const getCcdReasonCodeMap = (intl: IntlShape) =>
  readCodesIntoMap(intl, ( ccdReasonCodes as MapElement[]).concat(ccd80211ReasonCodes))

export const getClientEventsMap = (intl: IntlShape) => {
  const map = getCcdReasonCodeMap(intl)
  return {
    // reference for available codes:
    // https://github.com/rksg/rsa-mlisa-etl/blob/develop/src/main/scala/com/ruckuswireless/mlisa/MLISAConstants.scala
    // but text is specific to UI
    EVENT_CLIENT_JOIN: 'Client join',
    EVENT_CLIENT_INFO_UPDATED: 'Client associated (802.11)',
    EVENT_CLIENT_DISCONNECT: 'Client disconnected',
    EVENT_CLIENT_ROAMING: 'Client roamed',

    // https://jira.ruckuswireless.com/browse/MLSA-5033
    SG_DHCP_CCD_REASON_DISASSOC_STA_HAS_LEFT:
      map['CCD_REASON_DISASSOC_STA_HAS_LEFT'] +` ${intl.$t({ defaultMessage: '(DHCP Timeout)' })}`,
    SG_DHCP_CCD_REASON_DEAUTH_LEAVING:
      map['CCD_REASON_DEAUTH_LEAVING'] +` ${intl.$t({ defaultMessage: '(DHCP Timeout)' })}`
  }
}

export function clientEventDescription (
  intl: IntlShape,
  event: MapElement['code'],
  state?: string
) {
  const clientEventsMap = getClientEventsMap(intl)
  const ccdReasonCodeMap = getCcdReasonCodeMap(intl)

  if (!clientEventsMap.hasOwnProperty(event)) return ccdReasonCodeMap[event] || `${event}`
  const description = clientEventsMap[event as keyof typeof clientEventsMap]

  if (description !== clientEventsMap['EVENT_CLIENT_INFO_UPDATED']) return description

  return state === 're-associate'
    ? intl.$t({ defaultMessage: 'Client (re)associated (802.11)' })
    : description
}

export function mapCodeToReason (code: string, intl: IntlShape) {
  const failureLabels = getFailureLabels(intl)
  const failureTitles = (Object.keys(failureLabels).reduce((acc, code) => {
    acc[code] = `${failureLabels[code]} ${intl.$t({ defaultMessage: 'Failures' })}`
    return acc
  }, { ttc: intl.$t({ defaultMessage: 'Time To Connect' }) } as Record<string, string>))
  return failureTitles[code] || clientEventDescription(intl, code)
}
