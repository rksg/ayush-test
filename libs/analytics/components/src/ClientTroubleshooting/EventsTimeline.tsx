import React, { useEffect, useState } from 'react'

import { Row, Col }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import { flatten }                                          from 'lodash'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'
import { MessageDescriptor }                                from 'react-intl'

import {
  Incident, categoryCodeMap, IncidentCode
} from '@acx-ui/analytics/utils'
import { useDateFilter, getIntl, formatter, formats } from '@acx-ui/utils'

import {
  ClientTroubleShootingConfig,
  SUCCESS,
  FAILURE,
  SLOW,
  DISCONNECT,
  transformEvents,
  TYPES,
  formatEventDesc,
  DisplayEvent,
  LabelledQuality,
  transformConnectionQualities,
  connectionQualityLabels,
  connectionDetailsByAP,
  connectionDetailsByApChartData
} from './config'
import { transformIncidents, Item }        from './EventsHistory'
import { ClientInfoData, ConnectionEvent } from './services'
import * as UI                             from './styledComponents'
import { TimelineChart }                   from './TimelineChart'



import { Filters } from '.'

export interface Event {
  timestamp: string;
  event: string;
  ttc: string;
  mac: string;
  apName: string;
  path: [];
  code: string;
  state: string;
  failedMsgId: string;
  messageIds: string;
  radio: string;
  ssid: string;
  type: string;
  key: string;
  start: number;
  end: number;
  category: string;
  seriesKey: string;
}
export type TimelineData = {
  connectionEvents: eventsCategoryMap;
  roaming: eventsCategoryMap;
  connectionQuality: eventsCategoryMap;
  networkIncidents: networkIncidentCategoryMap;
}
type eventsCategoryMap = {
  [SUCCESS]: Event[] | [];
  [FAILURE]: Event[] | [];
  [DISCONNECT]: Event[] | [];
  [SLOW]: Event[] | [];
  all: Event[] | [];
}
type networkIncidentCategoryMap = {
  connection:Item[] |[],
  performance:Item[] |[],
  infrastructure:Item[] |[],
  all: Item[] | [];

}
type TimeLineProps = {
  data?: ClientInfoData;
  filters: Filters;
}
const getTimelineData = (events: Event[], incidents: Item[]) =>
{
  const categorisedEvents = events.reduce(
    (acc, event) => {
      if (event?.type === TYPES.CONNECTION_EVENTS) {
        acc[TYPES.CONNECTION_EVENTS as 'connectionEvents']['all'] = [
          ...acc[TYPES.CONNECTION_EVENTS as 'connectionEvents']['all'],
          event
        ]
        if (event.category === SUCCESS)
          acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][SUCCESS] = [
            ...acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][SUCCESS],
            event
          ]
        if (event.category === FAILURE)
          acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][FAILURE] = [
            ...acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][FAILURE],
            event
          ]
        if (event.category === DISCONNECT)
          acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][DISCONNECT] = [
            ...acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][DISCONNECT],
            event
          ]
        if (event.category === SLOW)
          acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][SLOW] = [
            ...acc[TYPES.CONNECTION_EVENTS as 'connectionEvents'][SLOW],
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
      acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['all'] = [
        ...acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['all'],
        incident
      ]
      if (categoryCodeMap['connection']?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['connection'] = [
          ...acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['connection'],
          incident
        ]
      if (categoryCodeMap['performance']?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['performance'] = [
          ...acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['performance'],
          incident
        ]
      if (categoryCodeMap['infrastructure']?.codes.includes(incident.code as IncidentCode))
        acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['infrastructure'] = [
          ...acc[TYPES.NETWORK_INCIDENTS as 'networkIncidents']['infrastructure'],
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
  return ''
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRoamingChartConfig = (data: any) => {
  return Object.keys(data).map(key => {
    return{ key: key, label: data[key].apName, chartType: 'bar', series: 'roaming' }
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRoamingSubtitleConfig = (data: any) => {
  return Object.keys(data).map((key,index) => {
    return {
      title: `${data[key].apName} on ${data[key].radio}GHz`,
      value: data[key].apName,
      isLast: Object.keys(data).length === index + 1 ? true : false
    }
  })
}
export function TimeLine (props: TimeLineProps) {
  const { $t } = useIntl()
  const intl = useIntl()
  const { data, filters } = props
  const types: string[] = flatten(filters ? filters.type ?? [[]] : [[]])
  const radios: string[] = flatten(filters ? filters.radio ?? [[]] : [[]])
  const selectedCategories: string[] = flatten(filters ? filters.category ?? [[]] : [[]])
  const roamingEventsAps = connectionDetailsByAP(data?.connectionDetailsByAp)
  const roamingEventsTimeSeries = connectionDetailsByApChartData(data?.connectionDetailsByAp)
  const qualties = transformConnectionQualities(data?.connectionQualities)
  const events = transformEvents(
    data?.connectionEvents as ConnectionEvent[],
    types,
    radios
  ) as Event[]
  const incidents = transformIncidents(
    data?.incidents as Incident[],
    selectedCategories,
    types,
    intl
  )
  const [expandObj, setExpandObj] = useState({
    connectionEvents: false,
    roaming: false,
    connectionQuality: false,
    networkIncidents: false
  })
  const onExpandToggle = (type: keyof TimelineData, toggle: boolean) =>
    setExpandObj({
      ...expandObj,
      [type]: !toggle
    })
  const toggleIcon = (isExpand: boolean, type: keyof TimelineData) =>
    isExpand ? (
      <UI.StyledMinusSquareOutlined
        style={{ cursor: 'pointer' }}
        onClick={() => onExpandToggle(type, expandObj[type])}
      />
    ) : (
      <UI.StyledPlusSquareOutlined
        style={{ cursor: 'pointer' }}
        onClick={() => onExpandToggle(type, expandObj[type])}
      />
    )

  const TimelineData = getTimelineData(events, incidents)
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'eventTimeSeriesGroup'
    }
  }

  useEffect(() => {
    connect('eventTimeSeriesGroup')
  }, [])
  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [
    moment(startDate).valueOf(),
    moment(endDate).valueOf()
  ]
  return (
    <Row gutter={[16, 16]} wrap={false}>
      <Col flex='200px'>
        <Row gutter={[16, 16]} style={{ rowGap: '4px' }}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <React.Fragment key={index}>
              <Col span={3}>
                {toggleIcon(
                  expandObj[config?.value as keyof TimelineData],
                  config?.value as keyof TimelineData
                )}
              </Col>
              <Col
                span={17}
                style={
                  expandObj[config?.value as keyof TimelineData]
                    ? {}
                    : { marginBottom: 38 }
                }
              >
                <UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>
              </Col>
              <Col style={{ lineHeight: '25px' }} span={4}>
                {config.showCount ? (
                  <UI.TimelineCount>
                    {TimelineData[config.value as keyof TimelineData]?.['all']
                      .length ?? 0}
                  </UI.TimelineCount>
                ) : null}
              </Col>
              {expandObj[config?.value as keyof TimelineData] &&
                (config.value === TYPES.ROAMING
                  ? getRoamingSubtitleConfig(roamingEventsAps)
                  : config?.subtitle
                )?.map((subtitle) => (
                  <React.Fragment key={subtitle.value}>
                    <Col
                      span={17}
                      offset={3}
                      style={subtitle.isLast ? { marginBottom: 40 } : {}}
                    >
                      <UI.TimelineSubContent>
                        {config.value === TYPES.ROAMING
                          ? subtitle.title as string
                          : $t(subtitle.title as MessageDescriptor) as string}
                      </UI.TimelineSubContent>
                    </Col>
                    <Col span={4}>
                      {config.showCount ? (
                        <UI.TimelineCount>
                          {TimelineData?.[config.value as keyof TimelineData]?.[
                            subtitle.value as keyof (
                              | eventsCategoryMap
                              | networkIncidentCategoryMap
                            )
                          ]?.length ?? 0}
                        </UI.TimelineCount>
                      ) : null}
                    </Col>
                  </React.Fragment>
                ))}
            </React.Fragment>
          ))}
        </Row>
      </Col>
      <Col flex='auto'>
        <Row gutter={[16, 16]} style={{ rowGap: 0 }}>
          {ClientTroubleShootingConfig.timeLine.map((config) => (
            <Col span={24} key={config.value}>
              <TimelineChart
                style={{ width: 'auto', marginBottom: 8 }}
                data={getChartData(
                  config?.value as keyof TimelineData,
                  events,
                  expandObj[config?.value as keyof TimelineData],
                  !Array.isArray(qualties) ? qualties.all : [],
                  Array.isArray(incidents) ? incidents : [],
                  roamingEventsTimeSeries
                )}
                showResetZoom={config?.showResetZoom}
                chartBoundary={chartBoundary}
                mapping={
                  expandObj[config?.value as keyof TimelineData]
                    ? config.value === TYPES.ROAMING
                      ? [
                        ...config.chartMapping,
                        ...(getRoamingChartConfig(roamingEventsAps) as {
                            key: string;
                            label: string;
                            chartType: string;
                            series: string;
                          }[])
                      ]
                      : config.chartMapping
                    : [config.chartMapping[0]]
                }
                hasXaxisLabel={config?.hasXaxisLabel}
                chartRef={connectChart}
                tooltipFormatter={useTooltipFormatter}
                // caputuring scatterplot dot click to open popover
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // onDotClick={(params) => {}}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  )
}
