import { EdgeAlarmSummary } from '../..'
import {
  EdgeHqosTrafficClass,
  EdgeHqosTrafficClassPriority
} from '../../models/EdgeQosProfilesEnum'

export interface EdgeHqosConfig {
    id?: string
    name?: string
    description?: string
    trafficClassSettings?: TrafficClassSetting[]
}

export interface EdgeHqosViewData extends EdgeHqosConfig {
    edgeClusterIds?: string[]
    edgeAlarmSummary?: EdgeAlarmSummary[]
}

export interface TrafficClassSetting {
    trafficClass?: EdgeHqosTrafficClass
    priority?: EdgeHqosTrafficClassPriority
    priorityScheduling?: boolean
    minBandwidth?: number
    maxBandwidth?: number
}

export const getDefaultTrafficClassListData = () => {
  return defaultTrafficClassListData
}

const defaultTrafficClassListData:TrafficClassSetting[] = [
  {
    trafficClass: EdgeHqosTrafficClass.VIDEO,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.VIDEO,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false
  }
]

