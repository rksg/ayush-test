import React from 'react'
import { useIntl }    from 'react-intl'
import {
  BillingCycleType
} from '@acx-ui/rc/utils'




function getDataConsumptionText (prop:DataConsumptionLabelProp) : string {
  const { $t } = useIntl()
  if (prop.dataCapacity === 0) {
    return $t({ defaultMessage: 'OFF' })
  }
  let res = 'Max Data: '
  if (prop.dataCapacity >= 1000)
    res += prop.dataCapacity/1000 + 'G'
  else
    res += prop.dataCapacity +'M'

  if (prop.billingCycleRepeat) {
    if (prop.billingCycleType === 'CYCLE_MONTHLY') {
      res += '(Monthly)'
    } else if (prop.billingCycleType === 'CYCLE_WEEKLY') {
      res += '(Weekly)'
    } else if (prop.billingCycleType === 'CYCLE_NUM_DAYS' && prop.billingCycleDays) {
      res += '(Per ' + prop.billingCycleDays + ' days)'
    }
  }
  return res
}

interface DataConsumptionLabelProp {
  dataCapacity: number
  billingCycleRepeat: boolean
  billingCycleType: BillingCycleType
  billingCycleDays: number | null
}

export function DataConsumptionLabel (props: DataConsumptionLabelProp) {
  return (<span>{getDataConsumptionText(props)}</span>)
}