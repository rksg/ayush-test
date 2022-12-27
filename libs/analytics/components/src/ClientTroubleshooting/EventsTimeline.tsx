/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect,useState } from 'react'

import { Row, Col }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'

import { cssStr }        from '@acx-ui/components'
import { useDateFilter } from '@acx-ui/utils'


import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, TYPES, formatEventDesc, DisplayEvent } from './config'
import { EventsChart }                                                                                                            from './EventsChart'
import { ClientInfoData,ConnectionEvent }                                                                                         from './services'
import * as UI                                                                                                                    from './styledComponents'

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
export const mapping = [
  { key: 'all', label: 'all', color: cssStr('--acx-viz-qualitative-5') },
  { key: 'success', label: 'success', color: cssStr('--acx-viz-qualitative-4') },
  { key: 'failure', label: 'failure', color: cssStr('--acx-viz-qualitative-2') },
  { key: 'slow', label: 'slow', color: cssStr('--acx-viz-qualitative-1') },
  { key: 'disconnect', label: 'disconnect', color: cssStr('--acx-viz-qualitative-3') }

] as { key: string, label: string, color: string }[]
export function TimeLine (props : TimeLineProps){
  const { $t } = useIntl()
  const intl = useIntl()
  const { data, filters } = props
  const types = filters ? filters.type ?? [] : []
  const radios = filters ? filters.radio ?? [] : []
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
  const onExpandToggle = (type: any, toggle : boolean) =>
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
  const subCharttooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
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
  const modifiedEvents = [
    ...events.map((event) => {
      return { ...event, seriesKey: event.category }
    })
  ] as Event[]
  const ChartEvents = [
    ...modifiedEvents.map((event) => {
      return { ...event, seriesKey: 'all' }
    }), ...modifiedEvents
  ] as Event[]
  return (
    <Row gutter={[16, 16]} style={{ flex: 1 }}>
      <Col span={8}>
        <Row gutter={[16, 16]}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (
            <>
              <Col span={2}
                onClick={() => onExpandToggle(config?.value, expandObj[
                  config?.value as keyof TimelineData
                ])}>
                {expandObj[
                  config?.value as keyof TimelineData
                ] ? (
                    <UI.StyledMinusSquareOutlined />
                  ) : (
                    <UI.StyledPlusSquareOutlined />
                  )}
              </Col>

              <Col span={16}>{$t(config.title)}</Col>
              <Col span={6}>{ TimelineData[config.value as keyof TimelineData]?.[
                'allEvents'
              ].length}</Col>
              { expandObj[
                  config?.value as keyof TimelineData
              ] && config?.subtitle?.map((subtitle, index) =>
                <>
                  <Col span={2}/>
                  <Col span={16}>{$t(subtitle.title)}</Col>
                  <Col span={6}>{TimelineData?.[config.value as keyof TimelineData]?.[
                      subtitle.value as keyof EventCategoryMap
                  ].length}</Col>
                </>
              )}
            </>
          ))}
        </Row>
      </Col>
      <Col span={16}>
        <Row gutter={[16, 16]}>
          {ClientTroubleShootingConfig.timeLine.map((config, index) => (

            <Col span={24}>
              <EventsChart
                style={{ width: 'auto', marginBottom: 8 }}
                data={
                  expandObj[
                    config?.value as keyof TimelineData
                  ] ?ChartEvents : modifiedEvents.map((event) => {
                      return { ...event, seriesKey: 'all' }
                    })
                }
                chartBoundary={chartBoundary}
                mapping={expandObj[
                  config?.value as keyof TimelineData
                ] ? mapping : [mapping[0]]}
                chartRef={connectChart}
                title={'test'}
                tooltipFormatter={subCharttooltipFormatter}
                onDotClick={(params) => {
                // eslint-disable-next-line no-console
                  console.log(params)
                }}
              />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  )
}