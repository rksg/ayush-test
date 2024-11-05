import _                from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { BonjourGatewayRule } from '../../models/BonjourGatewayRule'
import {
  ApMdnsProxyScopeData,
  MdnsActivation,
  MdnsProxyCreateApiPayload,
  MdnsProxyFormData,
  MdnsProxyForwardingRule,
  MdnsProxyGetApiResponse,
  MdnsProxyViewModel
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
      id: uuidv4(),
      ruleIndex: uuidv4()
    }
  })

  return {
    id: response.id,
    name: response.serviceName,
    rules: rules,
    scope: extractScopeFromApiPayload(response.aps)
  }
}

// eslint-disable-next-line max-len
export function convertMdnsProxyViewModelToMdnsProxyFormData (data: MdnsProxyViewModel): MdnsProxyFormData {
  return {
    id: data.id,
    name: data.name,
    rules: data.rules,
    scope: extractScopeFromViewModel(data.activations)
  } as MdnsProxyFormData
}

function extractScopeFromViewModel (activations: MdnsActivation[] = []): ApMdnsProxyScopeData[] {
  return activations.map(activation => ({
    venueId: activation.venueId,
    aps: activation.apSerialNumbers.map(serialNumber => ({ serialNumber }))
  }))
}

function extractApSerialNumberFromScope (scope: ApMdnsProxyScopeData[] = []): string[] {
  return scope.flatMap(s => s.aps.map(ap => ap.serialNumber))
}

// eslint-disable-next-line max-len
function extractScopeFromApiPayload (aps: { serialNumber: string, venueId: string }[] = []): ApMdnsProxyScopeData[] {
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
