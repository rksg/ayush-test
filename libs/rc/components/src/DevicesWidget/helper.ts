import { find } from 'lodash'

import { cssStr, DonutChartData } from '@acx-ui/components'
import {
  Dashboard,
  ApVenueStatusEnum,
  SwitchStatusEnum,
  EdgeStatusSeverityEnum,
  VenueDetailHeader,
  EdgeStatusSeverityStatistic
} from '@acx-ui/rc/utils'

import {
  getAPStatusDisplayName,
  getEdgeStatusDisplayName,
  getSwitchStatusDisplayName
} from '../MapWidget/VenuesMap/helper'

const seriesMappingSwitch = () => [
  { key: SwitchStatusEnum.DISCONNECTED,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.DISCONNECTED),
    color: cssStr('--acx-semantics-red-50') },
  { key: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.NEVER_CONTACTED_CLOUD),
    color: cssStr('--acx-neutrals-50') },
  { key: SwitchStatusEnum.INITIALIZING,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.INITIALIZING),
    color: cssStr('--acx-neutrals-50') },
  { key: SwitchStatusEnum.OPERATIONAL,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.OPERATIONAL),
    color: cssStr('--acx-semantics-green-50') }
] as Array<{ key: string, name: string, color: string }>

export const getSwitchDonutChartData = (overviewData: Dashboard | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchesSummary = overviewData?.summary?.switches?.summary
  if (switchesSummary) {
    seriesMappingSwitch().forEach(({ key, name, color }) => {
      const value = parseInt(switchesSummary[key as SwitchStatusEnum]!, 10)
      if(key === SwitchStatusEnum.INITIALIZING && value) {
        const neverContactedCloud = find(chartData, {
          name: getSwitchStatusDisplayName(SwitchStatusEnum.NEVER_CONTACTED_CLOUD) })
        if (neverContactedCloud) {
          const currentValue: number = neverContactedCloud.value
          neverContactedCloud.value = currentValue + value
        } else {
          chartData.push({ name, value, color })
        }
      } else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}

export const getVenueSwitchDonutChartData =
(venueDetails: VenueDetailHeader | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchesSummary = venueDetails?.switches?.summary
  if (switchesSummary) {
    seriesMappingSwitch().forEach(({ key, name, color }) => {
      const value = switchesSummary[key as SwitchStatusEnum]
      if(key === SwitchStatusEnum.INITIALIZING && value) {
        const neverContactedCloud = find(chartData, {
          name: getSwitchStatusDisplayName(SwitchStatusEnum.NEVER_CONTACTED_CLOUD) })
        if (neverContactedCloud) {
          const currentValue: number = neverContactedCloud.value
          neverContactedCloud.value = currentValue + value
        } else {
          chartData.push({ name, value, color })
        }
      } else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}

export const seriesMappingAP = () => [
  { key: ApVenueStatusEnum.REQUIRES_ATTENTION,
    name: getAPStatusDisplayName(ApVenueStatusEnum.REQUIRES_ATTENTION, false),
    color: cssStr('--acx-semantics-red-50') },
  { key: ApVenueStatusEnum.TRANSIENT_ISSUE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.TRANSIENT_ISSUE, false),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: ApVenueStatusEnum.IN_SETUP_PHASE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OFFLINE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.OFFLINE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OPERATIONAL,
    name: getAPStatusDisplayName(ApVenueStatusEnum.OPERATIONAL, false),
    color: cssStr('--acx-semantics-green-50') }
] as Array<{ key: string, name: string, color: string }>

export const getApDonutChartData =
(apsSummary: VenueDetailHeader['aps']['summary'] | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  if (apsSummary) {
    seriesMappingAP().forEach(({ key, name, color }) => {
      const value = apsSummary[key as ApVenueStatusEnum]
      if (key === ApVenueStatusEnum.OFFLINE && value) {
        const setupPhase = find(chartData, {
          name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE, false)
        })
        const value = apsSummary[key]!
        if (setupPhase) {
          setupPhase.name = `${setupPhase.name}: ${setupPhase.value}, ${name}: ${value}`
          setupPhase.value = setupPhase.value + value
        } else {
          chartData.push({ name, value, color })
        }
      }
      else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}

const seriesMappingEdge = () => [
  { key: EdgeStatusSeverityEnum.REQUIRES_ATTENTION,
    name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.REQUIRES_ATTENTION, false),
    color: cssStr('--acx-semantics-red-50') },
  { key: EdgeStatusSeverityEnum.TRANSIENT_ISSUE,
    name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.TRANSIENT_ISSUE, false),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: EdgeStatusSeverityEnum.IN_SETUP_PHASE,
    name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.IN_SETUP_PHASE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: EdgeStatusSeverityEnum.OFFLINE,
    name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.OFFLINE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: EdgeStatusSeverityEnum.OPERATIONAL,
    name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.OPERATIONAL, false),
    color: cssStr('--acx-semantics-green-50') }
] as Array<{ key: string, name: string, color: string }>

export const getEdgeDonutChartData: (statistic?: EdgeStatusSeverityStatistic) => DonutChartData[] =
(statistic) => {
  const chartData: DonutChartData[] = []
  if (statistic) {
    seriesMappingEdge().forEach(({ key, name, color }) => {
      const value = statistic.summary[key as EdgeStatusSeverityEnum]
      if (key === EdgeStatusSeverityEnum.OFFLINE) {
        const setupPhase = find(chartData, {
          name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.IN_SETUP_PHASE, false)
        })
        const offlineCount: number = value ?? 0
        if (setupPhase) {
          setupPhase.name = `${setupPhase.name}: ${setupPhase.value}, ${name}: ${offlineCount}`
          setupPhase.value = setupPhase.value + offlineCount
        } else {
          chartData.push({ name, value: offlineCount, color })
        }
      } else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}
