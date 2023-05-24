import React from 'react'

import { useIntl } from 'react-intl'

import { BillingCycleType } from '@acx-ui/rc/utils'

interface DataConsumptionLabelProp {
  dataCapacity: number
  billingCycleRepeat: boolean
  billingCycleType: BillingCycleType
  billingCycleDays: number | null
}

export function DataConsumptionLabel (props: DataConsumptionLabelProp) {
  const { $t } = useIntl()
  if (props.dataCapacity === 0) return <span>{$t({ defaultMessage: 'OFF' })}</span>
  const unit = props.dataCapacity >= 1000 ? 'G' : 'M'
  const dataCapacity = unit === 'G' ? props.dataCapacity / 1000 : props.dataCapacity

  return <span>{$t({ defaultMessage: `Max Data: {dataCapacity}{unit}
  {cycleType, select, 
    CYCLE_MONTHLY {(Monthly)}
    CYCLE_WEEKLY {(Weekly)}
    CYCLE_NUM_DAYS {(Per {cycleDays} days)}
    other {}
  }` }, {
    unit: unit,
    dataCapacity: dataCapacity,
    cycleType: props.billingCycleType,
    cycleDays: props.billingCycleDays
  })}</span>
}