import { EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export const edgeMdnsFormRequestPreProcess = (formData: EdgeMdnsProxyViewData) => {
  const payload = {
    name: formData.name,
    forwardingRules: (formData.forwardingRules ?? []).map(rule => {

      return {
        ...rule,
        serviceType: rule.service
      }
    })
  }

  return payload
}