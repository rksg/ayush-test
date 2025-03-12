import { groupBy } from 'lodash'

import { useStepFormContext }                              from '@acx-ui/components'
import { EdgeMdnsProxyViewData, MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

import { MdnsProxySummaryForm } from '../../../services/MdnsProxySummaryForm'

export function SummaryForm () {
  const { form } = useStepFormContext<EdgeMdnsProxyViewData>()
  const formValues = form.getFieldsValue(true)

  const venueGrouped = groupBy(formValues.activations, 'venueId')
  const scopeData = Object.entries(venueGrouped).map(([venueId, activations]) => {
    return {
      venueId,
      venueName: activations[0].venueName,
      edgeClusters: activations.map(item =>
        ({ id: item.edgeClusterId, name: item.edgeClusterName }))
    }
  })

  return <MdnsProxySummaryForm
    featureType={MdnsProxyFeatureTypeEnum.EDGE}
    name={formValues.name}
    rules={formValues.forwardingRules}
    scope={scopeData}
  />
}
