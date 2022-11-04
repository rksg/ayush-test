import { find } from 'lodash'

import { cssStr, DonutChartData } from '@acx-ui/components'
import {
  Dashboard,
  ApVenueStatusEnum,
  SwitchStatusEnum,
  VenueDetailHeader
} from '@acx-ui/rc/utils'

import { getAPStatusDisplayName, getSwitchStatusDisplayName } from '../MapWidget/VenuesMap/helper'

const seriesMappingSwitch = [
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
    seriesMappingSwitch.forEach(({ key, name, color }) => {
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
    seriesMappingSwitch.forEach(({ key, name, color }) => {
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

const seriesMappingAP = [
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
    seriesMappingAP.forEach(({ key, name, color }) => {
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
