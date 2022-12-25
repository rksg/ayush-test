import _                from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { BonjourGatewayRule } from '../../models/BonjourGatewayRule'
import {
  MdnsProxyCreateApiPayload,
  MdnsProxyFormData,
  MdnsProxyForwardingRule,
  MdnsProxyGetApiResponse,
  MdnsProxyScopeData
} from '../../types/services'


// eslint-disable-next-line max-len
export function convertMdnsProxyFormDataToApiPayload (data: MdnsProxyFormData): MdnsProxyCreateApiPayload {
  const convertedRules = convertMdnsProxyRule(data.rules)

  return {
    serviceName: data.name,
    rules: convertedRules,
    aps: extractApSerialNumberFromScope(data.scope)
  }
}

// eslint-disable-next-line max-len
export function convertApiPayloadToMdnsProxyFormData (response: MdnsProxyGetApiResponse): MdnsProxyFormData {
  const rules = (response.rules ?? []).map((rule: MdnsProxyForwardingRule) => {
    return {
      ...rule,
      id: uuidv4()
    }
  })

  return {
    id: response.id,
    name: response.serviceName,
    rules: rules,
    scope: extractScopeFromApiPayload(response.aps)
  }
}

function extractApSerialNumberFromScope (scope: MdnsProxyScopeData[] = []): string[] {
  return scope.flatMap(s => s.aps.map(ap => ap.serialNumber))
}

// eslint-disable-next-line max-len
function extractScopeFromApiPayload (aps: { serialNumber: string, venueId: string }[] = []): MdnsProxyScopeData[] {
  let venueMap: { [key: string]: { serialNumber: string }[] } = {}

  aps.forEach(item => {
    if (venueMap.hasOwnProperty(item.venueId)) {
      venueMap[item.venueId].push({ serialNumber: item.serialNumber })
    } else {
      venueMap[item.venueId] = [{ serialNumber: item.serialNumber }]
    }
  })

  return Object.keys(venueMap).map(venueId => ({ venueId, aps: venueMap[venueId] }))
}

function convertMdnsProxyRule (rules: MdnsProxyForwardingRule[] = []): BonjourGatewayRule[] {
  return rules.map((rule: MdnsProxyForwardingRule) => {
    const newRule = _.omit(rule, 'id')
    newRule.enabled = true
    return newRule
  })
}
