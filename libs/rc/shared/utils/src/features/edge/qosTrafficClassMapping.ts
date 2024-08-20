import _ from 'lodash'

import { EdgeQosTrafficClass, EdgeQosTrafficClassPriority } from '@acx-ui/rc/utils'

export const trafficClassToDisplay = (trafficClass?: string | EdgeQosTrafficClass) => {
  const trafficClassEnum = EdgeQosTrafficClass[trafficClass as keyof typeof EdgeQosTrafficClass]
  switch (trafficClassEnum) {
    case EdgeQosTrafficClass.BEST_EFFORT:
      return _.capitalize('BEST EFFORT')
  }
  return _.capitalize(trafficClass)
}

export const priorityToDisplay = (priority?: string | EdgeQosTrafficClassPriority) => {
  return _.capitalize(priority)
}