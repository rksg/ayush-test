import _, { find } from 'lodash'

import { cssStr, DonutChartData } from '@acx-ui/components'
import {
  Dashboard,
  ChartData,
  ApVenueStatusEnum,
  SwitchStatusEnum,
  EdgeStatusSeverityEnum,
  VenueDetailHeader,
  EdgeStatusSeverityStatistic,
  transformSwitchStatus
} from '@acx-ui/rc/utils'

import {
  getAPStatusDisplayName,
  getEdgeStatusDisplayName,
  getSwitchStatusDisplayName
} from '../MapWidget/VenuesMap/helper'

function sortByName (a: { name: string },b: { name: string }) {
  const x = a.name.toLowerCase()
  const y = b.name.toLowerCase()
  return x < y ? -1 : x > y ? 1 : 0
}

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

export const seriesSwitchStatusMapping = () => [
  { key: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
    name: transformSwitchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD).message,
    color: cssStr('--acx-neutrals-50')
  },
  { key: SwitchStatusEnum.INITIALIZING,
    name: transformSwitchStatus(SwitchStatusEnum.INITIALIZING).message,
    color: cssStr('--acx-neutrals-50')
  },
  { key: SwitchStatusEnum.FIRMWARE_UPD_START,
    name: transformSwitchStatus(SwitchStatusEnum.FIRMWARE_UPD_START).message,
    color: cssStr('--acx-semantics-yellow-40')
  },
  { key: SwitchStatusEnum.OPERATIONAL,
    name: transformSwitchStatus(SwitchStatusEnum.OPERATIONAL, true, true).message,
    color: cssStr('--acx-semantics-green-50')
  },
  { key: SwitchStatusEnum.DISCONNECTED,
    name: transformSwitchStatus(SwitchStatusEnum.DISCONNECTED).message,
    color: cssStr('--acx-semantics-red-50')
  },
  { key: SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED,
    name: transformSwitchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED).message,
    color: cssStr('--acx-neutrals-50')
  }
] as Array<{ key: string, name: string, color: string }>

export const getSwitchDonutChartData = (overviewData: Dashboard | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchesSummary = overviewData?.summary?.switches?.summary
  if (switchesSummary) {
    seriesMappingSwitch().forEach(({ key, name, color }) => {
      // ES response has different case (dev is upper case, qa is lower case)
      // eslint-disable-next-line max-len
      const count = switchesSummary[key as SwitchStatusEnum]! || _.get(switchesSummary, key.toLowerCase())
      const value = parseInt(count, 10)
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

export const getSwitchStackedBarChartData = (overviewData: Dashboard | undefined): ChartData[] => {
  const series = getSwitchDonutChartData(overviewData)
  const statusList = [
    SwitchStatusEnum.OPERATIONAL,
    SwitchStatusEnum.DISCONNECTED,
    SwitchStatusEnum.INITIALIZING
  ]
  const finalSeries=seriesMappingSwitch()
    .filter(status=>statusList.includes(status.key as SwitchStatusEnum)).map(status=>{
      const matched=series.filter(item=>item.name===status.name)
      let value=0
      if(matched.length){
        value=matched[0].value
      }
      /*
      We need to add weightage to maintain the color order on stackbar chart
      */
      switch(status.key){
        case SwitchStatusEnum.OPERATIONAL:
          return { name: `<3>${status.name}`, value }
        case SwitchStatusEnum.DISCONNECTED:
          return { name: `<2>${status.name}`, value }
        case SwitchStatusEnum.INITIALIZING:
          return { name: `<0>${status.name}`, value }
        default:
          return { name: `<4>${status.name}`, value }
      }
    })
  finalSeries.push({ name: '<1>Unknown', value: 0 })
  return [{
    category: '',
    series: finalSeries.sort(sortByName)
  }]
}

export const getVenueSwitchDonutChartData =
(venueDetails: VenueDetailHeader | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const switchesSummary = venueDetails?.switches?.summary
  if (switchesSummary) {
    seriesMappingSwitch().forEach(({ key, name, color }) => {
      // ES response has different case (dev is upper case, qa is lower case)
      // eslint-disable-next-line max-len
      const value = switchesSummary[key as SwitchStatusEnum]! || _.get(switchesSummary, key.toLowerCase())
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
(apsSummary: VenueDetailHeader['aps']['summary'] | undefined,
  shouldShowOffline:boolean=true): DonutChartData[] => {
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
          if(shouldShowOffline)
            setupPhase.name = `${setupPhase.name}: ${setupPhase.value}, ${name}: ${value}`
          else
            setupPhase.name = `${setupPhase.name}`
          setupPhase.value = setupPhase.value + value
        } else {
          if(shouldShowOffline)
            chartData.push({ name, value, color })
          else
            chartData.push({ name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE, false),
              value, color })
        }
      }
      else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}

export const getApStackedBarChartData =
(apsSummary: VenueDetailHeader['aps']['summary'] | undefined): ChartData[] => {
  const series = getApDonutChartData(apsSummary,false)
  const finalSeries=seriesMappingAP()
    .filter(status=>status.key!==ApVenueStatusEnum.OFFLINE).map(status=>{
      const matched=series.filter(item=>item.name===status.name)
      let value=0
      if(matched.length){
        value=matched[0].value
      }
      /*
      We need to add weightage to maintain the color order on stackbar chart
      */
      switch(status.key){
        case ApVenueStatusEnum.OPERATIONAL:
          return { name: `<3>${status.name}`, value }
        case ApVenueStatusEnum.TRANSIENT_ISSUE:
          return { name: `<2>${status.name}`, value }
        case ApVenueStatusEnum.REQUIRES_ATTENTION:
          return { name: `<1>${status.name}`, value }
        case ApVenueStatusEnum.IN_SETUP_PHASE:
          return { name: `<0>${status.name}`, value }
        default:
          return { name: `<4>${status.name}`, value }
      }
    })

  return [{
    category: '',
    series: finalSeries.sort(sortByName)
  }]
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

export const getEdgeDonutChartData:
  (statistic?: EdgeStatusSeverityStatistic,
    shouldShowOffline?: boolean) => DonutChartData[] =
(statistic, shouldShowOffline=true) => {
  const chartData: DonutChartData[] = []
  if (statistic) {
    seriesMappingEdge().forEach(({ key, name, color }) => {
      const value = statistic.summary[key as EdgeStatusSeverityEnum]
      if (key === EdgeStatusSeverityEnum.OFFLINE && value) {
        const setupPhase = find(chartData, {
          name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.IN_SETUP_PHASE, false)
        })
        const offlineCount = value

        // having setupPhase and offline at same time.
        if (setupPhase) {
          if (shouldShowOffline)
            setupPhase.name = `${setupPhase.name}: ${setupPhase.value}, ${name}: ${offlineCount}`

          // count offline together with setupPhase
          setupPhase.value = setupPhase.value + offlineCount
        } else {
          if (shouldShowOffline)
            chartData.push({ name, value: offlineCount, color })
          else
            chartData.push({
              name: getEdgeStatusDisplayName(EdgeStatusSeverityEnum.IN_SETUP_PHASE, false),
              value,
              color
            })
        }
      } else if (value) {
        chartData.push({ name, value, color })
      }
    })
  }
  return chartData
}
export const getEdgeStackedBarChartData =
(edgeSummary: VenueDetailHeader['edges'] | undefined): ChartData[] => {
  const series = getEdgeDonutChartData(edgeSummary, false)
  const finalSeries=seriesMappingEdge()
    .filter(status=>status.key!==ApVenueStatusEnum.OFFLINE).map(status=>{
      const matched=series.filter(item=>item.name===status.name)
      let value=0
      if(matched.length) {
        value=matched[0].value
      }
      /*
      We need to add weightage to maintain the color order on stackbar chart
      */
      switch(status.key) {
        case EdgeStatusSeverityEnum.OPERATIONAL:
          return { name: `<3>${status.name}`, value }
        case EdgeStatusSeverityEnum.TRANSIENT_ISSUE:
          return { name: `<2>${status.name}`, value }
        case EdgeStatusSeverityEnum.REQUIRES_ATTENTION:
          return { name: `<1>${status.name}`, value }
        case EdgeStatusSeverityEnum.IN_SETUP_PHASE:
          return { name: `<0>${status.name}`, value }
        default:
          return { name: `<4>${status.name}`, value }
      }

    })
  return [{
    category: '',
    series: finalSeries.sort(sortByName)
  }]
}
