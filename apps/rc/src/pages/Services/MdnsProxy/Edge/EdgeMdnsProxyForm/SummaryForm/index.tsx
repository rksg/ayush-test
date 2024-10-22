import { groupBy } from 'lodash'

import { useStepFormContext }                              from '@acx-ui/components'
import { MdnsProxySummary as GeneralMdnsProxySummary }     from '@acx-ui/rc/components'
import { EdgeMdnsProxyViewData, MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

export function SummaryForm () {
  const { form } = useStepFormContext<EdgeMdnsProxyViewData>()
  const formValues = form.getFieldsValue(true) as EdgeMdnsProxyViewData

  const venueGrouped = groupBy(formValues.activations, 'venueId')
  const scopeData = Object.entries(venueGrouped).map(([venueId, activations]) => {
    return {
      venueId,
      venueName: activations[0].venueName,
      edgeClusters: activations.map(item =>
        ({ id: item.edgeClusterId, name: item.edgeClusterName }))
    }
  })

  return <GeneralMdnsProxySummary
    featureType={MdnsProxyFeatureTypeEnum.EDGE}
    name={formValues.name ?? ''}
    rules={formValues.forwardingRules ?? []}
    scope={scopeData}
  />
}
