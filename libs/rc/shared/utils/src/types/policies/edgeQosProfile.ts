import { EdgeAlarmSummary }     from '../..'
import {
  EdgeQosTrafficClass,
  EdgeQosTrafficClassPriority
} from '../../models/EdgeQosProfilesEnum'

export interface EdgeQosConfig {
    id?: string
    name?: string
    description?: string
    trafficClassSettings?: TrafficClassSetting[]
}

export interface EdgeQosViewData extends EdgeQosConfig {
    edgeClusterIds?: string[]
    edgeAlarmSummary?: EdgeAlarmSummary[]
}

export interface TrafficClassSetting {
    trafficClass?: EdgeQosTrafficClass
    priority?: EdgeQosTrafficClassPriority
    priorityScheduling?: boolean
    minBandwidth?: number
    maxBandwidth?: number
}

export const getDefaultTrafficClassListData = () => {
  return defaultTrafficClassListData
}

const defaultTrafficClassListData:TrafficClassSetting[] = [
  {
    trafficClass: EdgeQosTrafficClass.VIDEO,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.VIDEO,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.VOICE,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.VOICE,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.BEST_EFFORT,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.BEST_EFFORT,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.BACKGROUND,
    priority: EdgeQosTrafficClassPriority.HIGH,
    priorityScheduling: false
  },
  {
    trafficClass: EdgeQosTrafficClass.BACKGROUND,
    priority: EdgeQosTrafficClassPriority.LOW,
    priorityScheduling: false
  }
]

