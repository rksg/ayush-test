import disconnectReasonCodes from './mapping/80211MgmtDeauthAndDisassociationFramesMap.json'
import ccd80211ReasonCodes   from './mapping/ccd80211ReasonCodeMap.json'
import ccdFailureTypes       from './mapping/ccdFailureTypeMap.json'
import ccdReasonCodes        from './mapping/ccdReasonCodeMap.json'

type ReadonlyMap = Readonly<Record<string, string>>

export const failureLabels: ReadonlyMap = ccdFailureTypes
  // TODO: remove concat when eapol added to mapping in shared
  .concat({ id: 7, code: 'eapol', text: 'EAPOL' })
  .reduce((acc, { code, text }) => {
    acc[code] = text
    return acc
  }, {} as Record<string, string>)

export const failureCodeMap: ReadonlyMap = Object.keys(failureLabels)
  .reduce((acc, code) => {
    acc[code] = `${failureLabels[code]} Failure`
    return acc
  }, {} as Record<string, string>)

export const failureTitles: ReadonlyMap = Object.keys(failureLabels).reduce((acc, code) => {
  acc[code] = `${failureLabels[code]} Failures`
  return acc
}, {} as Record<string, string>)

const map: ReadonlyMap = { ...failureTitles, ttc: 'Time To Connect' }

const ccdReasonCodeMap: ReadonlyMap = readReasonCodesIntoMap(
  ccdReasonCodes.concat(ccd80211ReasonCodes))

const clientEvents: ReadonlyMap = {
  // reference for available codes:
  // https://github.com/rksg/rsa-mlisa-etl/blob/develop/src/main/scala/com/ruckuswireless/mlisa/MLISAConstants.scala
  // but text is specific to UI
  EVENT_CLIENT_JOIN: 'Client join',
  EVENT_CLIENT_INFO_UPDATED: 'Client associated (802.11)',
  EVENT_CLIENT_DISCONNECT: 'Client disconnected',
  EVENT_CLIENT_ROAMING: 'Client roamed',

  // https://jira.ruckuswireless.com/browse/MLSA-5033
  SG_DHCP_CCD_REASON_DISASSOC_STA_HAS_LEFT:
    `${ccdReasonCodeMap['CCD_REASON_DISASSOC_STA_HAS_LEFT']} (DHCP Timeout)`,
  SG_DHCP_CCD_REASON_DEAUTH_LEAVING:
    `${ccdReasonCodeMap['CCD_REASON_DEAUTH_LEAVING']} (DHCP Timeout)`
}

export function clientEventDescription (
  event: keyof typeof clientEvents | keyof typeof ccdReasonCodeMap,
  state?: string
) {
  if (!clientEvents.hasOwnProperty(event)) return ccdReasonCodeMap[event] || event
  const description = clientEvents[event]

  if (description !== clientEvents['EVENT_CLIENT_INFO_UPDATED']) return description

  return state === 're-associate' ? 'Client (re)associated (802.11)' : description
}

interface ReasonCode {
  id: number
  code: number | string
  text: string
}

function readReasonCodesIntoMap ( codeMapList: ReasonCode[]) {
  return codeMapList.reduce((acc, codeMap) => {
    acc[codeMap.code] = codeMap.text
    return acc
  }, {} as Record<number|string, string>)
}

export function mapCodeToReason (code: string) {
  return map[code] || clientEventDescription(code)
}

const disconnectReasonCodeMap: ReadonlyMap = readReasonCodesIntoMap(disconnectReasonCodes)

export function mapDisconnectCodeToReason (id: string | null) {
  return (id && disconnectReasonCodeMap[id]) || 'Unknown'
}
