import React, { useEffect,useState } from 'react'

import { Row, Col }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'

import { getIntl, useDateFilter } from '@acx-ui/utils'


import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, TYPES, formatEventDesc, DisplayEvent, transformConnectionQualities, LabelledQuality } from './config'
import { ClientInfoData,ConnectionEvent }                                                                                                                                        from './services'
import * as UI                                                                                                                                                                   from './styledComponents'
import { TimelineChart }                                                                                                                                                         from './TimelineChart'

import { Filters } from '.'


type TimeLineProps = {
  data?: ClientInfoData,
  filters: Filters
}
export interface Event{
  timestamp: string,
  event: string,
  ttc: string,
  mac: string,
  apName: string,
  path: [],
  code: string,
  state: string,
  failedMsgId: string,
  messageIds: string,
  radio: string,
  ssid: string
  type: string
  key: string
  start: number,
  end: number,
  category: string,
  seriesKey: string
}
type EventCategoryMap = {
  [SUCCESS]: Event[] | [];
  [FAILURE]: Event[] | [];
  [DISCONNECT]: Event[] | [];
  [SLOW]: Event[] | [];
  allEvents: Event[] | [];
}
 type TimelineData = {
  connectionEvents :EventCategoryMap,
  roaming: EventCategoryMap,
  connectionQuality : EventCategoryMap,
  networkIncidents : EventCategoryMap
 }
const getTimelineData = (events: Event[]) =>
  events.reduce(
    (acc, event) => {
      if (event.type === TYPES.CONNECTION_EVENTS) {
        acc[TYPES.CONNECTION_EVENTS as keyof TimelineData]['allEvents'] = [
          ...acc[TYPES.CONNECTION_EVENTS as keyof TimelineData]['allEvents'],
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
        allEvents: []
      }
    } as TimelineData
  )
const getChartData = (
  type: keyof TimelineData,
  events: Event[],
  isExpanded: boolean,
  qualities?: LabelledQuality[]
) => {
  if (isExpanded) {
    if (type === TYPES.CONNECTION_EVENTS) {
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
    }
    if (type === TYPES.CONNECTION_QUALITY) {
      return qualities ?? []
    }
    if (type === TYPES.NETWORK_INCIDENTS) {
      return []
    }
    if (type === TYPES.ROAMING) {
      return []
    }
  } else {
    if (type === TYPES.CONNECTION_EVENTS) {
      return [
        ...events.map((event) => {
          return { ...event, seriesKey: 'all' }
        })
      ] as Event[]
    }
    if (type === TYPES.CONNECTION_QUALITY) {
      return qualities ?? []
    }
    if (type === TYPES.NETWORK_INCIDENTS) {
      return []
    }
    if (type === TYPES.ROAMING) {
      return []
    }
  }
  return []
}

export function TimeLine (props : TimeLineProps){
  const { $t } = useIntl()
  const intl = getIntl()
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
  const onExpandToggle = (type: keyof TimelineData, toggle : boolean) =>
    setExpandObj({
      ...expandObj,
      [type]: !toggle
    })

  const TimelineData = getTimelineData(events)
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'eventtTmeSeriesGroup'
    }
  }
  const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
    const evtObj =
      (Array.isArray(params) && Array.isArray(params[0].data)
        ? (params[0].data[2])
        : '') as unknown as DisplayEvent
    const tooltipText = formatEventDesc(evtObj, intl)
    return renderToString(
      <UI.TooltipWrapper>
        <UI.TooltipDate>{moment(evtObj.start).format('MMM DD HH:mm:ss')} </UI.TooltipDate>
        {tooltipText}
      </UI.TooltipWrapper>
    )
  }
  useEffect(() => { connect('eventtTmeSeriesGroup') }, [])
  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [moment(startDate).valueOf() , moment(endDate).valueOf() ]
  return (
    <Row gutter={[16, 16]} style={{ flex: 1 }}>
      <Col span={6}>
        <Row gutter={[16, 16]} style={{ rowGap: '4px' }}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <React.Fragment key={index}>
              <Col
                span={2}>
                {expandObj[config?.value as keyof TimelineData] ? (
                  <UI.StyledMinusSquareOutlined style={{ cursor: 'pointer' }}
                    onClick={() =>
                      onExpandToggle(
                        config?.value as keyof TimelineData,
                        expandObj[config?.value as keyof TimelineData]
                      )
                    }/>
                ) : (
                  <UI.StyledPlusSquareOutlined style={{ cursor: 'pointer' }}
                    onClick={() =>
                      onExpandToggle(
                        config?.value as keyof TimelineData,
                        expandObj[config?.value as keyof TimelineData]
                      )
                    }/>
                )}
              </Col>

              <Col
                span={18}
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
                      'allEvents'
                    ].length ?? 0}
                  </UI.TimelineCount>
                  : null}
              </Col>
              {expandObj[config?.value as keyof TimelineData] &&
                config?.subtitle?.map((subtitle, index) => (
                  <React.Fragment key={index}>
                    <Col span={2} />
                    <Col span={18}>
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
      <Col span={18}>
        <Row gutter={[16, 16]} style={{ rowGap: 0 }}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <Col span={24} key={index}>
              <TimelineChart
                style={{ width: 'auto', marginBottom: 8 }}
                data={
                  getChartData(
                    config?.value as keyof TimelineData,
                    events,
                    expandObj[config?.value as keyof TimelineData],
                    !Array.isArray(qualties) ? qualties.all : []
                  )
                }
                showResetZoom={config?.showResetZoom}
                chartBoundary={chartBoundary}
                mapping={
                  expandObj[config?.value as keyof TimelineData]
                    ? config.chartMapping
                    : [config.chartMapping[0]]
                }
                hasXaxisLabel={config?.hasXaxisLabel}
                chartRef={connectChart}
                tooltipFormatter={(config.value !== 'connectionQuality')
                  ? tooltipFormatter
                  : () => 'test'}
                // caputuring scatterplot dot click to open popover
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onDotClick={(params) => {}}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  )
}