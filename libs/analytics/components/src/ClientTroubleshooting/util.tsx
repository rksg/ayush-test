/* eslint-disable @typescript-eslint/no-explicit-any */
import {  TooltipComponentFormatterCallbackParams } from 'echarts'
import { maxBy, groupBy, flatMap }                  from 'lodash'
import moment                                       from 'moment-timezone'
import { renderToString }                           from 'react-dom/server'
import { IntlShape }                                from 'react-intl'

import {
  mapCodeToFailureText,
  clientEventDescription,
  Incident,
  incidentInformation,
  calculateSeverity,
  incidentSeverities,
  categoryOptions,
  shortDescription,
  categoryCodeMap, IncidentCode
} from '@acx-ui/analytics/utils'
import { formatter, getIntl, formats } from '@acx-ui/utils'

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
  Item,
  INCIDENT,
  connectionQualityLabels,
  TimelineData,
  Event
} from './config'
import { ConnectionEvent, ConnectionQuality } from './services'
import * as UI                                from './styledComponents'


/**
 * reference from: https://jira-wiki.ruckuswireless.com/pages/viewpage.action?spaceKey=Team&title=MLISA+Client+Troubleshooting
 */
 type connectionEventsKey = 'connectionEvents'
 type networkIncidentsKey = 'networkIncidents'
const connection = 'connection'
const performance = 'performance'
const infrastructure = 'infrastructure'
const all = 'all'

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
  value: number | null | undefined) => {
  switch (type) {
    case 'rss':        return { quality: getRSSConnectionQuality(value), value }
    case 'snr':        return { quality: getSNRConnectionQuality(value), value }
    case 'throughput': return { quality: getThroughputConnectionQuality(value), value }
    case 'avgTxMCS':   return { quality: getAvgTxMCSConnectionQuality(value), value }
    default:           return null
  }
}

export const takeWorseQuality = (...qualities: (string | null| undefined)[]) => {
  qualities = qualities.filter(q => q !== null)
  if (qualities.length === 0) return null

  const types = ['bad', 'average', 'good']
  const others = (qualities as string[]).filter(q => !types.includes(q))
  let type
  while ((type = types.shift())) {
    if (qualities.includes(type)) return type
  }

  const sets = Array.from(new Set(qualities))
    .map(quality => ({ quality, count: others.filter(q => q === quality).length }))

  const max = maxBy(sets, 'count')

  return max && max.quality
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getQualityColor = (type: any) => {
  switch (type) {
    case 'bad': return '--acx-semantics-red-50'
    case 'good': return '--acx-semantics-green-50'
    case 'average': return '--acx-neutrals-50'
    default: return '--acx-neutrals-30'
  }
}


export const transformEvents = (
  events: ConnectionEvent[],
  selectedEventTypes: string[],
  selectedRadios: string[]
) =>
  events.reduce((acc, data, index) => {
    const { event, state, timestamp, mac, ttc, radio, code, failedMsgId, ssid } = data
    if (code === 'eap' && failedMsgId && EAPOLMessageIds.includes(failedMsgId)) {
      data = { ...data, code: 'eapol' }
    }

    const category = categorizeEvent(event, ttc)
    const eventType = category === 'failure' ? filterEventMap[FAILURE] : event

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
    all: mappedQuality.map((val) => ({ ...val, seriesKey: 'all' })) as unknown as LabelledQuality[],
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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const connectionDetailsByAP = (data: any) => {
  return Object.entries(groupBy(data, ({ apMac, radio }) => `${apMac}-${radio}`)).reduce(
    (agg, [key, values]) => {
      // @ts-ignore: Unreachable code error
      agg[key] = {
        apMac: values[0].apMac,
        radio: values[0].radio,
        apName: [...new Set(values.map(({ apName }) => apName))].join(','),
        apModel: [...new Set(values.map(({ apModel }) => apModel))].join(','),
        apFirmware: [...new Set(values.map(({ apFirmware }) => apFirmware))].join(',')
      }
      return agg
    },
    {}
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const connectionDetailsByApChartData = (data: any) => {
  return Object.entries(groupBy(data, ({ apMac, radio }) => `${apMac}-${radio}`)).reduce(
    (agg, [key, values]) => {
      // @ts-ignore: Unreachable code error
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
    {}
  )
}

export const roamingColorMap = {
  good: 'rgba(35, 171, 54, 1)',
  average: 'rgba(172, 174, 176, 1)',
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

  const parseRGBA = (color: {
      replace: (
        arg0: RegExp,
        arg1: string
      ) => {
        (): any;
        new (): any;
        split: {
          (arg0: string): {
            (): any;
            new (): any;
            map: {
              (arg0: (v: any) => number): [any, any, any, any];
              new (): any;
            };
          };
          new (): any;
        };
      };
    }) => {
    const [r, g, b, a] = color
      .replace(/[rgba()]/gi, '')
      .split(',')
      .map((v: any) => Number(v))
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
    // @ts-ignore: Unreachable code error
    const rgbaFrom = parseRGBA(colorFrom)
    // @ts-ignore: Unreachable code error
    const rgbaTo = parseRGBA(colorTo)
    return new Array(rate).fill(0).map((_, index) => {
      const color = Object.keys(rgbaFrom).reduce((agg, key) => {
        // @ts-ignore: Unreachable code error
        const diff = (rgbaTo[key] - rgbaFrom[key]) / (rate - 1)
        // @ts-ignore: Unreachable code error

        agg[key] = Math.round(rgbaFrom[key] + diff * index)
        return agg
      }, {})
      const diff = (valueTo - valueFrom) / rate
      return {
        valueFrom: Math.round(valueFrom + index * diff),
        valueTo: Math.round(valueFrom + (index + 1) * diff),
        // @ts-ignore: Unreachable code error
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      }
    })
  }
  return flatMap(colorMap, (params) => getMidColor(params, density)).sort(
    (a, b) => a.valueFrom - b.valueFrom
  )
})()


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const roamingEventFormatter = (event : any) => {
  const labels = [
    { key: 'rss', label: 'RSS', format: formatter('decibelMilliWattsFormat') },
    { key: 'bssid', label: 'BSSID' },
    { key: 'channel', label: 'Channel' },
    { key: 'radioMode', label: 'Radio Mode' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { key: 'spatialStream', label: 'Spatial Stream (SS)', format: (v: any) => `${v} SS` },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { key: 'bandwidth', label: 'Bandwidth', format: (v: any) => `${v} MHz` }
  ]
  const details = event['details']
  const values = labels
    .filter(({ key }) => details[key] && details[key] !== 'Unknown')
    .map(({ key, label, format }) => ({
      label, value: (format && format(details[key])) || details[key]
    }))
  if (values.length === 0) return null
  return [{
    label: values.map(v => v.label).join(' / '),
    value: values.map(v => v.value).join(' / ')
  }]
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRoamingChartConfig = (data: any) => {
  return Object.keys(data).map(key => {
    return{ key: key, label: data[key].apName, chartType: 'bar', series: 'roaming' }
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRoamingSubtitleConfig = (data: any) => {
  return Object.keys(data).map((key,index) => {
    return {
      title: `${data[key].apName} on ${data[key].radio}GHz`,
      value: data[key].apName,
      isLast: Object.keys(data).length === index + 1 ? true : false
    }
  })
}
export const transformIncidents = (
  incidents: Incident[],
  selectedCategories: string [],
  selectedTypes: string [],
  intl: IntlShape
) =>
  incidents.reduce((acc, incident: Incident) => {
    const {
      category,
      subCategory,
      shortDescription: desc
    } = incidentInformation[incident.code]
    const severity = calculateSeverity(incident.severity)
    const color = incidentSeverities[severity].color
    const title = shortDescription({ ...incident, shortDescription: desc })
    const cat = categoryOptions.find(
      ({ label }) => intl.$t(label) === intl.$t(category)
    )
    if ((selectedCategories.length &&
        cat &&
        !selectedCategories.includes(cat.value)) ||
        (selectedTypes.length && !selectedTypes.includes(INCIDENT))
    ) {
      return acc
    }
    acc.push({
      id: incident.id,
      start: +new Date(incident.startTime),
      end: +new Date(incident.endTime),
      date: formatter('dateTimeFormatWithSeconds')(incident.startTime),
      description: `${intl.$t(category)} (${intl.$t(subCategory)})`,
      title,
      icon: <UI.IncidentEvent color={color}>{severity}</UI.IncidentEvent>,
      code: incident.code,
      color: color
    })
    return acc
  }, [] as Item[])

export const getTimelineData = (events: Event[], incidents: Item[]) =>
{
  const categorisedEvents = events.reduce(
    (acc, event) => {
      if (event?.type === TYPES.CONNECTION_EVENTS) {
        acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][all] = [
          ...acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][all],
          event
        ]
        if (event.category === SUCCESS)
          acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][SUCCESS] = [
            ...acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][SUCCESS],
            event
          ]
        if (event.category === FAILURE)
          acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][FAILURE] = [
            ...acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][FAILURE],
            event
          ]
        if (event.category === DISCONNECT)
          acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][DISCONNECT] = [
            ...acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][DISCONNECT],
            event
          ]
        if (event.category === SLOW)
          acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][SLOW] = [
            ...acc[TYPES.CONNECTION_EVENTS as connectionEventsKey][SLOW],
            event
          ]
      }
      return acc
    },
    {
      connectionEvents: {
        [SUCCESS]: [],
        [FAILURE]: [],
        [DISCONNECT]: [],
        [SLOW]: [],
        all: []
      }
    } as TimelineData
  )
  const categorisedIncidents = incidents.reduce(
    (acc, incident) => {
      acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][all] = [
        ...acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][all],
        incident
      ]
      if (categoryCodeMap[connection]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][connection] = [
          ...acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][connection],
          incident
        ]
      if (categoryCodeMap[performance]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][performance] = [
          ...acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][performance],
          incident
        ]
      if (categoryCodeMap[infrastructure]?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][infrastructure] = [
          ...acc[TYPES.NETWORK_INCIDENTS as networkIncidentsKey][infrastructure],
          incident
        ]
      return acc
    },
    {
      networkIncidents: {
        connection: [],
        performance: [],
        infrastructure: [],
        all: []
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
  incidents?: Item[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roamingEvents? : any
) => {
  if (isExpanded) {
    switch (type) {
      case TYPES.CONNECTION_EVENTS:
        const modifiedEvents = [
          ...events.map((event) => {
            return { ...event, seriesKey: event.category }
          })
        ] as Event[]
        return [
          ...modifiedEvents.map((event) => {
            return { ...event, seriesKey: 'all' }
          }),
          ...modifiedEvents
        ] as Event[]
      case TYPES.CONNECTION_QUALITY:
        return qualities ?? []
      case TYPES.NETWORK_INCIDENTS:
        return incidents ?? []
      case TYPES.ROAMING:
        return roamingEvents ?? []
    }
  }
  switch (type) {
    case TYPES.CONNECTION_EVENTS:
      return [
        ...events.map((event) => {
          return { ...event, seriesKey: 'all' }
        })
      ] as Event[]
    case TYPES.CONNECTION_QUALITY:
      return qualities ?? []
    case TYPES.NETWORK_INCIDENTS:
      return incidents ?? []
    case TYPES.ROAMING:
      return roamingEvents ?? []
  }
  return []
}

export const useTooltipFormatter = (
  params: TooltipComponentFormatterCallbackParams
) => {
  const intl = getIntl()
  const seriesName = (Array.isArray(params))
    ? params[0].seriesName
    : ''
  if(seriesName === 'quality') {
    const obj2 = (Array.isArray(params) && Array.isArray(params[0].data)
      ? params[0].data[3]
      : undefined) as unknown as DisplayEvent
    const tooltipText2 = obj2
      ? Object.keys(connectionQualityLabels).map(
        (key, index) =>
          `${formatter(
            connectionQualityLabels[key as keyof typeof connectionQualityLabels]
              .formatter as keyof typeof formats
          )(
            (obj2 as unknown as LabelledQuality)[
              key as keyof typeof connectionQualityLabels
            ].value
          )}${
            index + 1 !== Object.keys(connectionQualityLabels).length
              ? '/ '
              : ''
          }`
      )
      : null

    if (typeof obj2 !== 'undefined' && (obj2 as unknown as LabelledQuality).all) {
      return renderToString(
        <UI.TooltipWrapper>
          <UI.TooltipDate>
            {obj2 && moment(obj2?.start).format('MMM DD HH:mm:ss')}{' '}
            {Object.keys(connectionQualityLabels).map(
              (key,index) =>
                `${
                  connectionQualityLabels[
                  key as keyof typeof connectionQualityLabels
                  ].label
                }${index+1 !== Object.keys(connectionQualityLabels).length ?'/ ':''}`
            )}
            {':'}
          </UI.TooltipDate>
          {tooltipText2}
        </UI.TooltipWrapper>
      )
    }
  }
  if(seriesName === 'events') {
    const obj = (Array.isArray(params) && Array.isArray(params[0].data)
      ? params[0].data[2]
      : undefined) as unknown as DisplayEvent


    const tooltipText = obj ? formatEventDesc(obj, intl) : null
    return renderToString(
      <UI.TooltipWrapper>
        <UI.TooltipDate>
          {obj && moment(obj?.start).format('MMM DD HH:mm:ss')}{' '}
        </UI.TooltipDate>
        {tooltipText}
      </UI.TooltipWrapper>
    )
  }
  if(seriesName === 'incidents') {
    const obj = (Array.isArray(params) && Array.isArray(params[0].data)
      ? params[0].data[3]
      : undefined) as unknown as Item
    const tooltipText = obj ? obj.title : null
    return renderToString(
      <UI.TooltipWrapper>
        <UI.TooltipDate>
          {obj && moment(obj?.start).format('MMM DD HH:mm:ss')}{' '}
        </UI.TooltipDate>
        {tooltipText}
      </UI.TooltipWrapper>
    )
  }
  if(seriesName === 'roaming') {
    const obj = (Array.isArray(params) && Array.isArray(params[0].data)
      ? params[0].data[3]
      : undefined) as unknown as Item

    const tooltipText = roamingEventFormatter(obj)
    return renderToString(
      <UI.TooltipWrapper>
        <UI.TooltipDate>
          {obj && moment(obj?.start).format('MMM DD HH:mm:ss')}{' '}{tooltipText?.[0].label}{':'}
        </UI.TooltipDate>
        {tooltipText?.[0].value}
      </UI.TooltipWrapper>
    )
  }
  return ''
}