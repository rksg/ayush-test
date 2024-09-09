import _ from 'lodash'

import { EdgeHqosTrafficClass, EdgeHqosTrafficClassPriority } from '../../models/EdgeQosProfilesEnum'

export const trafficClassToDisplay = (trafficClass?: string | EdgeHqosTrafficClass) => {
  const trafficClassEnum = EdgeHqosTrafficClass[trafficClass as keyof typeof EdgeHqosTrafficClass]
  switch (trafficClassEnum) {
    case EdgeHqosTrafficClass.BEST_EFFORT:
      return _.capitalize('BEST EFFORT')
  }
  return _.capitalize(trafficClass)
}

export const priorityToDisplay = (priority?: string | EdgeHqosTrafficClassPriority) => {
  return _.capitalize(priority)
}