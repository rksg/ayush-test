/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect,useState } from 'react'

import { Collapse }                                         from 'antd'
import { Row, Col }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'

import { cssStr }        from '@acx-ui/components'
import { useDateFilter } from '@acx-ui/utils'


import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, TYPES, formatEventDesc, DisplayEvent } from './config'
// import { EventsChart }                                                                                                            from './EventsChart'
import { EventsChart }                    from './EventsChart'
import { EventsScatterChart }             from './EventsScatterChart'
import { ClientInfoData,ConnectionEvent } from './services'
import * as UI                            from './styledComponents'

import { Filters } from '.'


const { Panel } = Collapse
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
export const mapping = [
  { key: 'ap', label: 'AP', color: cssStr('--acx-viz-qualitative-4') },
  { key: 'apGroup', label: 'AP Group', color: cssStr('--acx-viz-qualitative-3') },
  { key: 'wlan', label: 'WLAN', color: cssStr('--acx-viz-qualitative-2') },
  { key: 'venue', label: 'Venue', color: cssStr('--acx-viz-qualitative-1') }
] as { key: string, label: string, color: string }[]
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
  const mainCharttooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
    const evtObj =
      (Array.isArray(params) && Array.isArray(params[0].data)
        ? (params[0].data[2])
        : '') as unknown as DisplayEvent
    return renderToString(
      <UI.TooltipWrapper>
        {moment(evtObj.start).format('MMM DD')}
      </UI.TooltipWrapper>
    )
  }
  const subCharttooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
    const evtObj =
      (Array.isArray(params) && Array.isArray(params[0].data)
        ? (params[0].data[2])
        : '') as unknown as DisplayEvent
    const tooltipText = formatEventDesc(evtObj, intl)
    return renderToString(
      <UI.TooltipWrapper>
        {moment(evtObj.start).format('HH:mm:ss')} {tooltipText}
      </UI.TooltipWrapper>
    )
  }
  useEffect(() => { connect('eventtTmeSeriesGroup') }, [])
  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [moment(startDate).valueOf() , moment(endDate).valueOf() ]
  // return (
  //   <UI.CollapseBox
  //     expandIcon={({ isActive }) =>
  //       isActive ? (
  //         <UI.StyledMinusSquareOutlined />
  //       ) : (
  //         <UI.StyledPlusSquareOutlined />
  //       )
  //     }
  //     ghost>
  //     {ClientTroubleShootingConfig.timeLine.map((config, index) => (
  //       <Panel
  //         header={
  //           <UI.TimelineTitle
  //             onClick={(event) => event.stopPropagation()}>
  //             {config?.chartType === 'scatter' ? (
  //               <EventsScatterChart
  //                 style={{ width: 'auto', marginBottom: 8 }}
  //                 data={
  //                   TimelineData[config.value as keyof TimelineData][
  //                     'allEvents'
  //                   ]
  //                 }
  //                 chartBoundary={chartBoundary}
  //                 chartRef={connectChart}
  //                 title={$t(config.title)}
  //                 tooltopEnabled
  //                 tooltipFormatter={mainCharttooltipFormatter}
  //                 onDotClick={(params) => {
  //                   // eslint-disable-next-line no-console
  //                   console.log(params)
  //                 }}
  //               />
  //             ) : (
  //               $t(config.title)
  //             )}
  //           </UI.TimelineTitle>
  //         }
  //         key={index}>
  //         <UI.TimelineSubContent>
  //           {config?.subtitle?.map((subtitle, index) =>
  //             subtitle?.chartType === 'scatter' ? (
  //               <EventsScatterChart
  //                 style={{ width: 'auto', marginBottom: 4 }}
  //                 data={
  //                   TimelineData[config.value as keyof TimelineData][
  //                     subtitle.value as keyof EventCategoryMap
  //                   ]
  //                 }
  //                 chartBoundary={chartBoundary}
  //                 chartRef={connectChart}
  //                 title={$t(subtitle.title)}
  //                 key={index}
  //                 tooltipFormatter={subCharttooltipFormatter}
  //                 tooltopEnabled={!!subtitle?.isLast}
  //                 onDotClick={(params) => {
  //                   // eslint-disable-next-line no-console
  //                   console.log(params)
  //                 }}
  //               />
  //             ) : (
  //               $t(subtitle.title)
  //             )
  //           )}
  //         </UI.TimelineSubContent>
  //       </Panel>
  //     ))}
  //   </UI.CollapseBox>
  // )
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
  console.log(ChartEvents)
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
                {' '}
                {expandObj[
                  config?.value as keyof TimelineData
                ] ? (
                    <UI.StyledMinusSquareOutlined />
                  ) : (
                    <UI.StyledPlusSquareOutlined />
                  )}
              </Col>

              <Col span={16}>{$t(config.title)}</Col>
              <Col span={6}>{2}</Col>
            </>
          ))}
        </Row>
      </Col>
      <Col span={16}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <EventsChart
              style={{ width: 'auto', marginBottom: 8 }}
              data={
                ChartEvents
              }
              chartBoundary={chartBoundary}
              chartRef={connectChart}
              title={'test'}
              tooltipFormatter={subCharttooltipFormatter}
              onDotClick={(params) => {
                // eslint-disable-next-line no-console
                console.log(params)
              }}
            />
          </Col>
          <Col span={24}>
            {'chart'}
          </Col>
          <Col span={24}>
            {'chart'}
          </Col>
          <Col span={24}>
            {'chart'}
          </Col>
        </Row>
      </Col>
    </Row>
  )
}