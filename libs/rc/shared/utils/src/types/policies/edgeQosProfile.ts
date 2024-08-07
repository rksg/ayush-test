import { EdgeAlarmSummary }     from '../..'
import {
  EdgeQosTrafficClass,
  EdgeQosTrafficClassPriority
} from '../../models/EdgeQosProfilesEnum'

export interface EdgeQosConfig {
    id: string
    name: string
    description?: string
    trafficClassSettings?: TrafficClassSetting[]
}

export interface EdgeQosViewData {
    id: string
    name: string
    description: string
    trafficClassSettings: TrafficClassSetting[]
    edgeClusterIds: string[]
    edgeAlarmSummary: EdgeAlarmSummary[]
}

export interface TrafficClassSetting {
    trafficClass: EdgeQosTrafficClass
    priority: EdgeQosTrafficClassPriority
    priorityScheduling: boolean
    minBandwidth: number
    maxBandwidth: number
}
