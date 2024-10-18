import { EdgeAlarmSummary }      from '../..'
import {
  EdgeHqosTrafficClass,
  EdgeHqosTrafficClassPriority
} from '../../models/EdgeHqosProfilesEnum'

export interface EdgeHqosConfig {
    id?: string
    name?: string
    description?: string
    trafficClassSettings?: TrafficClassSetting[]
    isDefault?: boolean
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
    priorityScheduling: true,
    maxBandwidth: 100,
    minBandwidth: 15
  },
  {
    trafficClass: EdgeHqosTrafficClass.VIDEO,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 5
  },
  {
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: true,
    maxBandwidth: 100,
    minBandwidth: 25
  },
  {
    trafficClass: EdgeHqosTrafficClass.VOICE,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 5
  },
  {
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 20
  },
  {
    trafficClass: EdgeHqosTrafficClass.BEST_EFFORT,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 5
  },
  {
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.HIGH,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 10
  },
  {
    trafficClass: EdgeHqosTrafficClass.BACKGROUND,
    priority: EdgeHqosTrafficClassPriority.LOW,
    priorityScheduling: false,
    maxBandwidth: 100,
    minBandwidth: 1
  }
]

