import { maxBy, groupBy, flatMap } from 'lodash'
import moment                      from 'moment-timezone'
import { IntlShape }               from 'react-intl'

import {
  mapCodeToFailureText,
  clientEventDescription,
  Incident,
  incidentInformation,
  calculateSeverity,
  incidentSeverities,
  categoryOptions,
  shortDescription,
  categoryCodeMap,
  IncidentCode
} from '@acx-ui/analytics/utils'
import { formatter, formats, DateFormatEnum } from '@acx-ui/formatter'
import { TimeStampRange }                     from '@acx-ui/types'
import { getIntl }                            from '@acx-ui/utils'

import {
  rssGroups,
  EAPOLMessageIds,
  filterEventMap,
  spuriousEvents,
  DisplayEvent,
  TYPES,
  INFO_UPDATED,
  JOIN,
  ROAMED,
  DISCONNECT,
  FAILURE,
  SLOW,
  SUCCESS,
  LabelledQuality,
  IncidentDetails,
  INCIDENT,
  connectionQualityLabels,
  TimelineData,
  Event,
  RoamingByAP,
  RoamingTimeSeriesData,
  RoamingConfigParam,
  Quality,
  EVENTS,
  QUALITY,
  ROAMING,
  INCIDENTS,
  ALL
} from './config'
import { ConnectionEvent, ConnectionQuality } from './services'
import * as UI                                from './styledComponents'

type ConnectionEventsKey = 'connectionEvents'
type NetworkIncidentsKey = 'networkIncidents'
type RoamingEventsKey = 'roaming'
type RBGA = { r: number; b: number; g: number; a: number }
const connection = 'connection'
const performance = 'performance'
const infrastructure = 'infrastructure'
const dateFormat = 'MMM DD HH:mm:ss'
const EAP = 'eap'
const EAPOL = 'eapol'

// Utils for Connection Event data starts
export const transformEvents = (
  events: ConnectionEvent[],
  selectedEventTypes: string[],
  selectedRadios: string[]
) =>
  events.reduce((acc, data, index) => {
    const { event, state, timestamp, mac, ttc, radio, code, failedMsgId, ssid } = data
    if (code === EAP && failedMsgId && EAPOLMessageIds.includes(failedMsgId)) {
      data = { ...data, code: EAPOL }
    }

    const category = categorizeEvent(event, ttc)
    const eventType = category === FAILURE ? filterEventMap[FAILURE] : event

    const filterEventTypes = selectedEventTypes.map(
      (e) => filterEventMap[e as keyof typeof filterEventMap]
    )
    const filterRadios = selectedRadios.map(
      (e) => filterEventMap[e as keyof typeof filterEventMap]
    )
    const time = +new Date(timestamp)
    let skip =
      spuriousEvents.includes(state) ||
      (filterEventTypes.length && !filterEventTypes.includes(eventType)) ||
      (filterRadios.length && !filterRadios.includes(radio))

    if (skip) return acc

    acc.push({
      ...data,
      type: event === 'EVENT_CLIENT_ROAMING' ? TYPES.ROAMING : TYPES.CONNECTION_EVENTS,
      key: time + mac + eventType + index,
      start: time,
      end: time,
      ssid,
      category
    })
    return acc
  }, [] as object[])

export const formatEventDesc = (evtObj: DisplayEvent, intl: IntlShape): string => {
  const { code, apName, mac, radio, state, event } = evtObj
  const ap = [apName, mac ? `(${mac})` : ''].filter(Boolean).join(' ')
  return [
    code ? `${mapCodeToFailureText(code, intl)}:` : '',
    `${intl.$t(clientEventDescription(event, state))} @`,
    `${ap} ${formatter('radioFormat')(radio)}`
  ]
    .filter(Boolean)
    .join(' ')
}

export const categorizeEvent = (name: string, ttc: number | null) => {
  const successEvents = [INFO_UPDATED, JOIN, ROAMED].map(
    (key) => filterEventMap[key as keyof typeof filterEventMap]
  )
  if (name === 'EVENT_CLIENT_DISCONNECT') return DISCONNECT
  if (!successEvents.includes(name)) return FAILURE
  if (ttc !== null && ttc >= 4000) return SLOW
  return SUCCESS
}
// Utils for Connection Event data ends

// Utils for Roaming starts
export const connectionDetailsByAP = (data: RoamingByAP[]) => {
  return Object.entries(groupBy(data, ({ apMac, radio }) => `${apMac}-${radio}`)).reduce(
    (agg, [key, values]) => {
      agg[key] = {
        apMac: values[0]?.apMac,
        radio: values[0].radio,
        apName: [...new Set(values.map(({ apName }) => apName))].join(','),
        apModel: [...new Set(values.map(({ apModel }) => apModel))].join(','),
        apFirmware: [...new Set(values.map(({ apFirmware }) => apFirmware))].join(',')
      }
      return agg
    },
    {} as { [key: string]: object }
  )
}

export const connectionDetailsByApChartData = (data: RoamingByAP[]) => {
  return Object.entries(groupBy(data, ({ apMac, radio }) => `${apMac}-${radio}`)).reduce(
    (agg, [key, values]) => {
      agg[key] = {
        events: values.map((value) => {
          return {
            start: value.start,
            end: value.end,
            label: key,
            value: formatter('decibelMilliWattsFormat')(value.rss),
            color: getRssColor(value.rss),
            details: value
          }
        })
      }
      return agg
    },
    {} as { [key: string]: object }
  )
}

export const roamingColorMap = {
  good: 'rgba(35, 171, 54, 1)',
  average: 'rgba(247, 180, 30, 1)',
  bad: 'rgba(237, 28, 36, 1)',
  missing: 'rgba(235, 237, 238, 1)',
  min: 'rgba(237, 28, 36, 1)',
  max: 'rgba(35, 171, 54, 1)'
}
export const rssMax = -50
export const rssMin = -90
export const getRssColor = (rss: number) => {
  if (rss > rssMax) return roamingColorMap.max
  if (rss < rssMin) return roamingColorMap.min
  return rssGradientColorMap.find(
    ({ valueFrom, valueTo }) => valueFrom <= Math.round(rss) && valueTo >= Math.round(rss)
  )?.color
}
export const rssGradientColorMap = ((density = 5) => {
  const avg = (a: number, b: number) => Math.round((a + b) / 2)
  const colorMap = [
    {
      valueFrom: avg(rssMax, rssGroups.average.upper),
      valueTo: rssMax,
      colorFrom: roamingColorMap.good,
      colorTo: roamingColorMap.max
    },
    {
      valueFrom: avg(rssGroups.average.upper, rssGroups.average.lower),
      valueTo: avg(rssMax, rssGroups.average.upper) - 1,
      colorFrom: roamingColorMap.average,
      colorTo: roamingColorMap.good
    },
    {
      valueFrom: avg(rssMin, rssGroups.average.lower),
      valueTo: avg(rssGroups.average.upper, rssGroups.average.lower) - 1,
      colorFrom: roamingColorMap.bad,
      colorTo: roamingColorMap.average
    },
    {
      valueFrom: rssMin,
      valueTo: avg(rssMin, rssGroups.average.lower) - 1,
      colorFrom: roamingColorMap.min,
      colorTo: roamingColorMap.bad
    }
  ]

  const parseRGBA = (color: string) => {
    const [r, g, b, a] = color
      .replace(/[rgba()]/gi, '')
      .split(',')
      .map((v) => Number(v))
    return { r, g, b, a }
  }

  const getMidColor = (
    {
      colorFrom,
      colorTo,
      valueFrom,
      valueTo
    }: {
      valueFrom: number;
      valueTo: number;
      colorFrom: string;
      colorTo: string;
    },
    rate: number
  ) => {
    const rgbaFrom = parseRGBA(colorFrom)
    const rgbaTo = parseRGBA(colorTo)
    return new Array(rate).fill(0).map((_, index) => {
      const color = Object.keys(rgbaFrom).reduce((agg, key) => {
        const diff = (rgbaTo[key as keyof RBGA] - rgbaFrom[key as keyof RBGA]) / (rate - 1)

        agg[key] = Math.round(rgbaFrom[key as keyof RBGA] + diff * index)
        return agg
      }, {} as { [key: string]: number })
      const diff = (valueTo - valueFrom) / rate
      return {
        valueFrom: Math.round(valueFrom + index * diff),
        valueTo: Math.round(valueFrom + (index + 1) * diff),
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      }
    })
  }
  return flatMap(colorMap, (params) => getMidColor(params, density)).sort(
    (a, b) => a.valueFrom - b.valueFrom
  )
})()

export const roamingEventFormatter = (details: RoamingByAP) => {
  const labels = [
    { key: 'rss', label: 'RSS', format: formatter('decibelMilliWattsFormat') },
    { key: 'bssid', label: 'BSSID' },
    { key: 'channel', label: 'Channel' },
    { key: 'radioMode', label: 'Radio Mode' },
    { key: 'spatialStream', label: 'Spatial Stream (SS)', format: (v: string) => `${v} SS` },
    { key: 'bandwidth', label: 'Bandwidth', format: (v: string) => `${v} MHz` }
  ]
  const values = labels
    .filter(
      ({ key }) =>
        details[key as keyof RoamingByAP] && details[key as keyof RoamingByAP] !== 'Unknown'
    )
    .map(({ key, label, format }) => ({
      label,
      value:
        (format && format(details[key as keyof RoamingByAP] as string)) ||
        details[key as keyof RoamingByAP]
    }))
  return [
    {
      label: values.map((v) => v.label).join(' / '),
      value: values.map((v) => v.value).join(' / ')
    }
  ]
}
export const getRoamingChartConfig = (data: RoamingConfigParam) => {
  return Object.keys(data).map((key) => {
    return {
      key: key,
      label: data[key].apName,
      chartType: 'bar',
      series: ROAMING
    }
  })
}
export const getRoamingSubtitleConfig = (data: RoamingConfigParam) => {
  if (Object.keys(data).length === 0) {
    return [{
      title: 'No Data',
      apMac: 'No Data',
      apModel: '',
      apFirmware: '',
      value: '',
      isLast: true,
      noData: true
    }]
  }

  return Object.keys(data).map((key, index) => {
    return {
      title: `${data[key].apName} on ${data[key].radio}GHz`,
      apMac: data[key].apMac,
      apModel: data[key].apModel,
      apFirmware: data[key].apFirmware,
      value: data[key].apName,
      noData: false,
      isLast: Object.keys(data).length === index + 1 ? true : false
    }
  })
}
// Utils for Roaming ends

// Utils for Connection Quality starts
const getRSSConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  if (value >= rssGroups.good.lower) return 'good'
  if (value >= rssGroups.average.lower) return 'average'
  return 'bad'
}

const getSNRConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  if (value >= 15) return 'good'
  if (value > 5) return 'average'
  return 'bad'
}

const getThroughputConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value > 2) return 'good'
  if (value >= 1) return 'average'
  return 'bad'
}

const getAvgTxMCSConnectionQuality = (value: number | null | undefined) => {
  if (value === null || value === undefined) return null
  value = value / 1024
  if (value >= 36) return 'good'
  if (value > 11) return 'average'
  return 'bad'
}

export const getConnectionQualityFor = (
  type: 'rss' | 'snr' | 'throughput' | 'avgTxMCS',
  value: number | null | undefined
) => {
  switch (type) {
    case 'rss':
      return { quality: getRSSConnectionQuality(value), value }
    case 'snr':
      return { quality: getSNRConnectionQuality(value), value }
    case 'throughput':
      return { quality: getThroughputConnectionQuality(value), value }
    case 'avgTxMCS':
      return { quality: getAvgTxMCSConnectionQuality(value), value }
  }
}

export const takeWorseQuality = (...qualities: (string | null | undefined)[]) => {
  qualities = qualities.filter((q) => q !== null)
  if (qualities.length === 0) return null

  const types = ['bad', 'average', 'good']
  const others = (qualities as string[]).filter((q) => !types.includes(q))
  let type
  while ((type = types.shift())) {
    if (qualities.includes(type)) return type
  }

  const sets = Array.from(new Set(qualities)).map((quality) => ({
    quality,
    count: others.filter((q) => q === quality).length
  }))

  const max = maxBy(sets, 'count')

  return max && max.quality
}

export const getQualityColor = (type: Quality) => {
  switch (type) {
    case 'bad':
      return '--acx-semantics-red-50'
    case 'good':
      return '--acx-semantics-green-50'
    case 'average':
      return '--acx-semantics-yellow-50'
    default:
      return '--acx-neutrals-50'
  }
}

export const transformConnectionQualities = (connectionQualities?: ConnectionQuality[]) => {
  if (typeof connectionQualities === 'undefined') {
    return []
  }

  const mappedQuality = connectionQualities.map((val) => {
    const rss = getConnectionQualityFor('rss', val.rss)
    const snr = getConnectionQualityFor('snr', val.snr)
    const throughput = getConnectionQualityFor('throughput', val.throughput)
    const avgTxMCS = getConnectionQualityFor('avgTxMCS', val.avgTxMCS)
    const worseQuality = takeWorseQuality(
      ...[rss?.quality, snr?.quality, throughput?.quality, avgTxMCS?.quality]
    )
    return {
      ...val,
      rss,
      snr,
      throughput,
      avgTxMCS,
      all: { quality: worseQuality }
    }
  })

  return {
    all: mappedQuality.map((val) => ({ ...val, seriesKey: ALL })) as unknown as LabelledQuality[],
    rss: mappedQuality
      .filter((val) => val.rss)
      .map((val) => ({ ...val, seriesKey: 'rss' })) as unknown as LabelledQuality[],
    snr: mappedQuality
      .filter((val) => val.snr)
      .map((val) => ({ ...val, seriesKey: 'snr' })) as unknown as LabelledQuality[],
    throughput: mappedQuality
      .filter((val) => val.throughput)
      .map((val) => ({ ...val, seriesKey: 'throughput' })) as unknown as LabelledQuality[],
    avgTxMCS: mappedQuality
      .filter((val) => val.avgTxMCS)
      .map((val) => ({ ...val, seriesKey: 'avgTxMCS' })) as unknown as LabelledQuality[]
  }
}
// Utils for Connection Quality ends

// Utils for Network Incidents starts
export const transformIncidents = (
  incidents: Incident[],
  selectedCategories: string[],
  selectedTypes: string[],
  intl: IntlShape
) =>
  incidents.reduce((acc, incident: Incident) => {
    const { category, subCategory, shortDescription: desc } = incidentInformation[incident.code]
    const severity = calculateSeverity(incident.severity)
    const color = incidentSeverities[severity].color
    const title = shortDescription({ ...incident, shortDescription: desc })
    const cat = categoryOptions.find(({ label }) => intl.$t(label) === intl.$t(category))
    if (
      (selectedCategories.length && cat && !selectedCategories.includes(cat.value)) ||
      (selectedTypes.length && !selectedTypes.includes(INCIDENT))
    ) {
      return acc
    }
    acc.push({
      id: incident.id,
      start: +new Date(incident.startTime),
      end: +new Date(incident.endTime),
      date: formatter(DateFormatEnum.DateTimeFormatWithSeconds)(incident.startTime),
      description: `${intl.$t(category)} (${intl.$t(subCategory)})`,
      title,
      icon: <UI.IncidentEvent color={color}>{severity}</UI.IncidentEvent>,
      code: incident.code,
      color: color
    })
    return acc
  }, [] as IncidentDetails[])
// Utils for Network Incidents ends

// General Util for the chart's data, tooltip formatter

export const getTimelineData = (events: Event[], incidents: IncidentDetails[]) => {
  const categorisedEvents = events.reduce(
    (acc, event) => {
      if (event?.type === TYPES.CONNECTION_EVENTS) {
        acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][ALL] = [
          ...acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][ALL],
          event
        ]
        if (event.category === SUCCESS)
          acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][SUCCESS] = [
            ...acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][SUCCESS],
            event
          ]
        if (event.category === FAILURE)
          acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][FAILURE] = [
            ...acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][FAILURE],
            event
          ]
        if (event.category === DISCONNECT)
          acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][DISCONNECT] = [
            ...acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][DISCONNECT],
            event
          ]
        if (event.category === SLOW)
          acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][SLOW] = [
            ...acc[TYPES.CONNECTION_EVENTS as ConnectionEventsKey][SLOW],
            event
          ]
      }
      if (event?.type === TYPES.ROAMING) {
        acc[TYPES.ROAMING as RoamingEventsKey][ALL] = [
          ...acc[TYPES.ROAMING as RoamingEventsKey][ALL],
          event
        ]
      }
      return acc
    },
    {
      [TYPES.CONNECTION_EVENTS]: {
        [SUCCESS]: [],
        [FAILURE]: [],
        [DISCONNECT]: [],
        [SLOW]: [],
        [ALL]: []
      },
      [TYPES.ROAMING]: {
        [ALL]: []
      }
    } as unknown as TimelineData
  )
  const categorisedIncidents = incidents.reduce(
    (acc, incident) => {
      acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][ALL] = [
        ...acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][ALL],
        incident
      ]
      if (categoryCodeMap[connection]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][connection] = [
          ...acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][connection],
          incident
        ]
      if (categoryCodeMap[performance]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][performance] = [
          ...acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][performance],
          incident
        ]
      if (categoryCodeMap[infrastructure]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][infrastructure] = [
          ...acc[TYPES.NETWORK_INCIDENTS as NetworkIncidentsKey][infrastructure],
          incident
        ]
      return acc
    },
    {
      networkIncidents: {
        connection: [],
        performance: [],
        infrastructure: [],
        [ALL]: []
      }
    } as TimelineData
  )

  return { ...categorisedEvents, ...categorisedIncidents }
}
export const getChartData = (
  type: keyof TimelineData,
  events: Event[],
  isExpanded: boolean,
  qualities?: LabelledQuality[],
  incidents?: IncidentDetails[],
  roamingEvents?: RoamingTimeSeriesData[]
) => {
  switch (type) {
    case TYPES.CONNECTION_EVENTS:
      const modifiedEvents = [
        ...events.map((event) => {
          return { ...event, seriesKey: event.category }
        })
      ] as Event[]
      return isExpanded
        ? ([
          ...modifiedEvents.map((event) => {
            return { ...event, seriesKey: ALL }
          }),
          ...modifiedEvents
        ] as Event[])
        : ([
          ...events.map((event) => {
            return { ...event, seriesKey: ALL }
          })
        ] as Event[])
    case TYPES.CONNECTION_QUALITY:
      return qualities ?? []
    case TYPES.NETWORK_INCIDENTS:
      return incidents ?? []
    case TYPES.ROAMING:
      return roamingEvents ?? []
  }
  return []
}

export function calculateInterval (timewindow: TimeStampRange) {
  const [start, end] = timewindow
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  const second = 1000
  const minute = second * 60
  const hour = minute * 60
  const day = hour * 24
  switch (true) {
    case interval > 24 * 7:
      return day
    case interval > 24:
      return hour
    case interval > 1:
      return minute
    case interval > 0.5:
      return second * 10
    default:
      return second * 5
  }
}

export const labelFormatter = (input: unknown, timewindow: TimeStampRange) => {
  const params = input as { value:number, seriesData: Object }
  const intl = getIntl()
  const trackerDate = (params)?.value
  const seriesData = (params)?.seriesData
  const seriesName = Array.isArray(seriesData) ? seriesData[0]?.seriesName : ''
  const seriesType = Array.isArray(seriesData) ? seriesData[0]?.seriesType : null

  const getScatterText = () => {
    const obj = (Array.isArray(seriesData) && Array.isArray(seriesData[0].data)
      ? seriesData[0].data[2]
      : undefined) as unknown as DisplayEvent
    const interval = calculateInterval(timewindow)
    const trackerHasData =
    ((trackerDate >= (obj?.start - interval)) && (trackerDate <= (obj?.end + interval)))
    const tooltipText = trackerHasData ? formatEventDesc(obj, intl) : null
    const date = moment(obj?.start).format(dateFormat)
    return tooltipText ? `${date} ${tooltipText}` : ''
  }

  if (seriesName === QUALITY) {
    const obj = (Array.isArray(seriesData) && Array.isArray(seriesData[0].data)
      ? seriesData[0].data[3]
      : undefined) as unknown as DisplayEvent
    const trackerHasData =
      (trackerDate >= moment(obj?.start).valueOf()) && (trackerDate <= moment(obj?.end).valueOf())
    const date = moment(obj?.start).format(dateFormat)
    const tooltipPrefixText = Object.keys(connectionQualityLabels).map(
      (key, index) =>
        `${connectionQualityLabels[key as keyof typeof connectionQualityLabels].label}${
          index + 1 !== Object.keys(connectionQualityLabels).length ? '/ ' : ''
        }`
    )
    const tooltipSuffixText = trackerHasData
      ? Object.keys(connectionQualityLabels).map(
        (key, index) =>
          `${formatter(
              connectionQualityLabels[key as keyof typeof connectionQualityLabels]
                .formatter as keyof typeof formats
          )(
            (obj as unknown as LabelledQuality)[key as keyof typeof connectionQualityLabels].value
          )}${index + 1 !== Object.keys(connectionQualityLabels).length ? ' / ' : ''}`
      )
      : null
    if ((obj as unknown as LabelledQuality)?.all) {
      const validValuesLen = tooltipSuffixText && tooltipSuffixText
        .filter(val => !val.match('^- /|-$'))
        .length

      return validValuesLen && validValuesLen !== 0
        ? `${date} ${tooltipPrefixText.join('')} : ${tooltipSuffixText.join('')}`
        : ''
    }
  }

  if (seriesName === EVENTS) {
    return getScatterText()
  }

  if (seriesName === INCIDENTS) {
    const obj = (Array.isArray(seriesData) && Array.isArray(seriesData[0].data)
      ? seriesData[0].data[3]
      : undefined) as unknown as IncidentDetails
    const trackerHasData = (trackerDate >= obj?.start) && (trackerDate <= (obj?.end as number))
    const tooltipText = trackerHasData ? obj.title : null
    const date = moment(obj?.start).format(dateFormat)
    return tooltipText ? `${date} ${tooltipText}` : ''
  }

  if (seriesName === ROAMING) {

    if (seriesType === 'scatter') {
      return getScatterText()
    }

    if (seriesType === 'custom') {
      const obj = (Array.isArray(seriesData) && Array.isArray(seriesData[0].data)
        ? seriesData[0].data[3]
        : undefined) as unknown as RoamingTimeSeriesData
      const trackerHasData =
      trackerDate >= moment(obj?.start).valueOf() && trackerDate <= moment(obj?.end).valueOf()
      const tooltipText = trackerHasData ? roamingEventFormatter(obj.details) : null
      const date = moment(obj?.start).format(dateFormat)

      return tooltipText
        ? `${date} ${tooltipText?.[0].label} : ${tooltipText?.[0].value}`
        : ''
    }
  }

  return ''
}
