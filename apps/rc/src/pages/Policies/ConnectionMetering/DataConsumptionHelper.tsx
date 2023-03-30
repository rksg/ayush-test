import React from 'react'

import {
  BillingCycleType
} from '@acx-ui/rc/utils'




function getDataConsumptionText (prop:DataConsumptionLabelProp) : string {
  if (prop.dataCapacity === 0) {
    return prop.onOffShow
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
    // eslint-disable-next-line max-len
    } else if (prop.billingCycleType === 'CYCLE_NUM_DAYS' && prop.billingCycleDays !== undefined) {
      res += '(Per ' + prop.billingCycleDays + ' days)'
    }
  }
  return res
}

interface DataConsumptionLabelProp {
  onOffShow: string
  dataCapacity: number
  billingCycleRepeat: boolean
  billingCycleType?: BillingCycleType
  billingCycleDays?: number
}

export function DataConsumptionLabel (props: DataConsumptionLabelProp) {
  return (<span>{getDataConsumptionText(props)}</span>)
}