import { EdgeAlarmSummary } from '../..'
import {
  Priority,
  TrafficClass
} from '../../models/EdgeQosEnum'

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
    trafficClass: TrafficClass
    priority: Priority
    priorityScheduling: boolean
    minBandwidth: number
    maxBandwidth: number
}