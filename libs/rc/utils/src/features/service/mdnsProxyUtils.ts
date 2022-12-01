import {
  MdnsProxyCreateApiPayload,
  MdnsProxyFormData,
  MdnsProxyGetApiResponse,
  MdnsProxyScopeData
} from '../../types/services'

// eslint-disable-next-line max-len
export function convertMdnsProxyFormDataToApiPayload (data: MdnsProxyFormData): MdnsProxyCreateApiPayload {
  return {
    serviceName: data.name,
    rules: data.forwardingRules,
    aps: extractApSerialNumberFromScope(data.scope)
  }
}

// eslint-disable-next-line max-len
export function convertApiPayloadToMdnsProxyFormData (response: MdnsProxyGetApiResponse): MdnsProxyFormData {
  return {
    id: response.id,
    name: response.serviceName,
    forwardingRules: response.rules,
    scope: extractScopeFromApiPayload(response.aps)
  }
}

function extractApSerialNumberFromScope (scope: MdnsProxyScopeData[] = []): string[] {
  return scope.flatMap(s => s.aps.map(ap => ap.serialNumber))
}

// eslint-disable-next-line max-len
function extractScopeFromApiPayload (aps: { ap: string, venue: string }[] = []): MdnsProxyScopeData[] {
  let venueMap: { [key: string]: { serialNumber: string }[] } = {}

  aps.forEach(item => {
    if (venueMap.hasOwnProperty(item.venue)) {
      venueMap[item.venue].push({ serialNumber: item.ap })
    } else {
      venueMap[item.venue] = [{ serialNumber: item.ap }]
    }
  })

  return Object.keys(venueMap).map(venueId => ({ venueId, aps: venueMap[venueId] }))
}
