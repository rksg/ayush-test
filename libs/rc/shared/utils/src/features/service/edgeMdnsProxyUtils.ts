import { omit } from 'lodash'

import { EdgeMdnsProxySetting, EdgeMdnsProxyViewData } from '../../types/services/edgeMdnsProxyService'

// eslint-disable-next-line max-len
export const edgeMdnsFormRequestPreProcess = (formData: EdgeMdnsProxyViewData) => {
  const payload = {
    name: formData.name,
    forwardingRules: (formData.forwardingRules ?? []).map(rule => {
      return {
        ...omit(rule, 'service'),
        serviceType: rule.service
      }
    })
  }

  return payload
}

// eslint-disable-next-line max-len
export const transformEdgeMdnsRulesToViewModelType = (rules: EdgeMdnsProxySetting['forwardingRules']) : EdgeMdnsProxyViewData['forwardingRules'] => {
  return rules.map((r, idx) =>
    ({
      ...omit(r, 'serviceType'),
      service: r.serviceType,
      ruleIndex: idx
    })) as EdgeMdnsProxyViewData['forwardingRules']
}