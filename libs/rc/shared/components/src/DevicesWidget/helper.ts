import { find, get } from 'lodash'

import { cssStr, DonutChartData } from '@acx-ui/components'
import {
  Dashboard,
  ChartData,
  ApVenueStatusEnum,
  SwitchStatusEnum,
  EdgeStatusSeverityEnum,
  VenueDetailHeader,
  EdgeStatusSeverityStatistic,
  transformSwitchStatus,
  IotControllerStatusEnum,
  getIotControllerStatus,
  IotControllerStatus,
  RWGStatusEnum,
  getRwgStatus,
  RWGRow
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
    color: cssStr('--acx-semantics-green-50') },
  { key: SwitchStatusEnum.APPLYING_FIRMWARE,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.APPLYING_FIRMWARE),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED),
    color: cssStr('--acx-neutrals-50') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_START,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_START),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: SwitchStatusEnum.FIRMWARE_UPD_FAIL,
    name: getSwitchStatusDisplayName(SwitchStatusEnum.FIRMWARE_UPD_FAIL),
    color: cssStr('--acx-semantics-yellow-40') }
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
  const chartData: { [name: string]: DonutChartData } = {}
  const switchesSummary = overviewData?.summary?.switches?.summary

  if (switchesSummary) {
    seriesMappingSwitch().forEach(({ key, name, color }) => {
      // ES response has different case (dev is upper case, qa is lower case)
      // eslint-disable-next-line max-len
      const count = switchesSummary[key as SwitchStatusEnum]! || get(switchesSummary, key.toLowerCase())
      const value = parseInt(count, 10)

      if (value) {
        if (chartData[name]) {
          // If the name already exists, aggregate the value
          chartData[name].value += value
        } else {
          // If the name doesn't exist, create a new entry
          chartData[name] = { name, value, color }
        }
      }
    })
  }

  // Convert the aggregated data back to an array
  return Object.values(chartData)
}

export const getSwitchStackedBarChartData = (overviewData: Dashboard | undefined): ChartData[] => {
  const series = getSwitchDonutChartData(overviewData)

  const statusList = [
    'Operational',
    'Alerting',
    'In Setup Phase',
    'Requires Attention'
  ]

  const finalSeries = statusList.map(status=>{
    const matched=series.filter(item=>item.name===status)
    let value=0
    if(matched.length){
      value=matched[0].value
    }
    /*
    We need to add weightage to maintain the color order on stackbar chart
    */
    switch(status){
      case 'Operational':
        return { name: `<3>${status}`, value }
      case 'Requires Attention':
        return { name: `<2>${status}`, value }
      case 'Alerting':
        return { name: `<1>${status}`, value }
      case 'In Setup Phase':
        return { name: `<0>${status}`, value }
      default:
        return { name: `<0>${status}`, value }
    }
  })

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
      const value = switchesSummary[key as SwitchStatusEnum]! || get(switchesSummary, key.toLowerCase())
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

export const seriesMappingAP = (combineInSetupPhaseAndOffline:boolean = false) => [
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
  ...(!combineInSetupPhaseAndOffline? [] : [{ key: ApVenueStatusEnum.IN_SETUP_PHASE_AND_OFFLINE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE_AND_OFFLINE, false),
    color: cssStr('--acx-neutrals-50') }]),
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

const _getApStackedBarChartData =
(apsSummary: VenueDetailHeader['aps']['summary'] | undefined): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  if (apsSummary) {
    let inSetupPhaseAndOfflineCount = 0
    let offlineColor = ''
    seriesMappingAP().forEach(({ key, name, color }) => {
      const value = apsSummary[key as ApVenueStatusEnum]
      if (value) {
        // combine the InSetupPhase and Offline count
        if (key === ApVenueStatusEnum.OFFLINE || key === ApVenueStatusEnum.IN_SETUP_PHASE) {
          inSetupPhaseAndOfflineCount = inSetupPhaseAndOfflineCount + value
          offlineColor = color
        }
        else {
          chartData.push({ name, value, color })
        }
      }
    })
    if (inSetupPhaseAndOfflineCount > 0) {
      chartData.push({
        name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE_AND_OFFLINE, false),
        value: inSetupPhaseAndOfflineCount,
        color: offlineColor })
    }
  }
  return chartData
}

export const getApStackedBarChartData =
(apsSummary: VenueDetailHeader['aps']['summary'] | undefined): ChartData[] => {
  const excludingApStatus = [
    ApVenueStatusEnum.OFFLINE,
    ApVenueStatusEnum.IN_SETUP_PHASE
  ] as string[]

  const series = _getApStackedBarChartData(apsSummary)

  const finalSeries = seriesMappingAP(true)
    .filter(status=>(!excludingApStatus.includes(status.key)))
    .map(status=>{
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
        case ApVenueStatusEnum.IN_SETUP_PHASE_AND_OFFLINE:
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

export const getRwgDonutChartData =
(rwgs: RWGRow[]): DonutChartData[] => {
  const chartData: DonutChartData[] = []

  const rwgMap = new Map<RWGStatusEnum, number>(rwgs?.map(({ status }) =>
    [status, 0]))

  for (let { status } of rwgs as RWGRow[]) {
    if (rwgMap) {
      const value: number = rwgMap.get(status) as number
      rwgMap.set(status, value + 1)
    }
  }

  Array.from(rwgMap).forEach(([status, value]) => {
    const { name, color } = getRwgStatus(status)
    chartData.push({ name, value, color: cssStr(color) })
  })

  return chartData
}

export const getRwgStackedBarChartData =
(rwgList: RWGRow[]): { chartData: ChartData[], stackedColors: string[] } => {
  let map = new Map(rwgList?.map(({ status }) =>
    [status, { name: getRwgStatus(status).name, value: 0 }]))
  for (let { status } of rwgList as RWGRow[]) {
    if (map && map.get(status)) {
      (map.get(status) as { name: string; value: number }).value++
    }
  }

  const result = Array.from(map.values())

  let colors: string[] = []

  Array.from(map.keys()).map(status => {
    colors.push(cssStr(getRwgStatus(status).color))
  })

  return {
    chartData: [{
      category: '',
      series: result
    }],
    stackedColors: colors
  }
}

export const getIotControllerDonutChartData =
(iotControllers: IotControllerStatus[]): DonutChartData[] => {
  const chartData: DonutChartData[] = []

  const rwgMap = new Map<IotControllerStatusEnum, number>(iotControllers?.map(({ status }) =>
    [status, 0]))

  for (let { status } of iotControllers as IotControllerStatus[]) {
    if (rwgMap) {
      const value: number = rwgMap.get(status) as number
      rwgMap.set(status, value + 1)
    }
  }

  Array.from(rwgMap).forEach(([status, value]) => {
    const { name, color } = getIotControllerStatus(status)
    chartData.push({ name, value, color: cssStr(color) })
  })

  return chartData
}

export const getIotControllerStackedBarChartData =
(iotControllers: IotControllerStatus[]): { chartData: ChartData[], stackedColors: string[] } => {
  let map = new Map(iotControllers?.map(({ status }) =>
    [status, { name: getIotControllerStatus(status).name, value: 0 }]))
  for (let { status } of iotControllers as IotControllerStatus[]) {
    if (map && map.get(status)) {
      (map.get(status) as { name: string; value: number }).value++
    }
  }

  const result = Array.from(map.values())

  let colors: string[] = []

  Array.from(map.keys()).map(status => {
    colors.push(cssStr(getIotControllerStatus(status).color))
  })

  return {
    chartData: [{
      category: '',
      series: result
    }],
    stackedColors: colors
  }
}

