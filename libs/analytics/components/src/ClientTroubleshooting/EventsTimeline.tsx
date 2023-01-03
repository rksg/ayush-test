import React, { useEffect, useState } from 'react'

import { Row, Col }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'

import { useDateFilter, getIntl } from '@acx-ui/utils'

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
  transformConnectionQualities
} from './config'
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
  connectionEvents: EventCategoryMap;
  roaming: EventCategoryMap;
  connectionQuality: EventCategoryMap;
  networkIncidents: EventCategoryMap;
}
type EventCategoryMap = {
  [SUCCESS]: Event[] | [];
  [FAILURE]: Event[] | [];
  [DISCONNECT]: Event[] | [];
  [SLOW]: Event[] | [];
  all: Event[] | [];
}
type TimeLineProps = {
  data?: ClientInfoData;
  filters: Filters;
}
const getTimelineData = (events: Event[]) =>
  events.reduce(
    (acc, event) => {
      if (event.type === TYPES.CONNECTION_EVENTS) {
        acc[TYPES.CONNECTION_EVENTS as keyof TimelineData]['all'] = [
          ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData]['all'],
          event
        ]
        if (event.category === SUCCESS)
          acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][SUCCESS] = [
            ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][SUCCESS],
            event
          ]
        if (event.category === FAILURE)
          acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][FAILURE] = [
            ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][FAILURE],
            event
          ]
        if (event.category === DISCONNECT)
          acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][DISCONNECT] = [
            ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][DISCONNECT],
            event
          ]
        if (event.category === SLOW)
          acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][SLOW] = [
            ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData][SLOW],
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
export const getChartData = (
  type: keyof TimelineData,
  events: Event[],
  isExpanded: boolean,
  qualities?: LabelledQuality[]
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
        return []
      case TYPES.ROAMING:
        return []
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
      return []
    case TYPES.ROAMING:
      return []
  }
  return []
}

export const useTooltipFormatter = (
  params: TooltipComponentFormatterCallbackParams
) => {
  return ''
  // const intl = getIntl()
  // const obj = (Array.isArray(params) && Array.isArray(params[0].data)
  //   ? params[0].data[2]
  //   : undefined) as unknown as DisplayEvent

  // if (typeof obj !== 'undefined' && (obj as unknown as LabelledQuality).all) {
  //   return renderToString(
  //     <UI.TooltipWrapper>
  //       <UI.TooltipDate>
  //         {(obj as unknown as LabelledQuality).all}
  //       </UI.TooltipDate>
  //     </UI.TooltipWrapper>
  //   )
  // }


  // const tooltipText = obj ? formatEventDesc(obj, intl) : null
  // return renderToString(
  //   <UI.TooltipWrapper>
  //     <UI.TooltipDate>
  //       {obj && moment(obj?.start).format('MMM DD HH:mm:ss')}{' '}
  //     </UI.TooltipDate>
  //     {tooltipText}
  //   </UI.TooltipWrapper>
  // )
}
export function TimeLine (props: TimeLineProps) {
  const { $t } = useIntl()
  const { data, filters } = props
  const types = filters ? filters.type ?? [] : []
  const radios = filters ? filters.radio ?? [] : []
  const qualties = transformConnectionQualities(data?.connectionQualities)
  const events = transformEvents(
    data?.connectionEvents as ConnectionEvent[],
    types,
    radios
  ) as Event[]
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

  const TimelineData = getTimelineData(events)
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
                }>
                <UI.TimelineTitle>{$t(config.title)}</UI.TimelineTitle>
              </Col>
              <Col style={{ lineHeight: '25px' }} span={4}>
                { (config.showCount)
                  ? <UI.TimelineCount>
                    {TimelineData[config.value as keyof TimelineData]?.[
                      'all'
                    ].length ?? 0}
                  </UI.TimelineCount>
                  : null}
              </Col>
              {expandObj[config?.value as keyof TimelineData] &&
                config?.subtitle?.map((subtitle) => (
                  <React.Fragment key={subtitle.value}>
                    <Col span={17} offset={3}>
                      <UI.TimelineSubContent>
                        {$t(subtitle.title)}
                      </UI.TimelineSubContent>
                    </Col>
                    <Col
                      span={4}
                      style={subtitle.isLast ? { marginBottom: 40 } : {}}>
                      {(config.showCount)
                        ? <UI.TimelineCount>
                          {TimelineData?.[config.value as keyof TimelineData]?.[
                          subtitle.value as keyof EventCategoryMap
                          ].length ?? 0}
                        </UI.TimelineCount>
                        : null}
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
                  !Array.isArray(qualties) ? qualties.all : []
                )}
                showResetZoom={config?.showResetZoom}
                chartBoundary={chartBoundary}
                mapping={
                  expandObj[config?.value as keyof TimelineData]
                    ? config.chartMapping
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
