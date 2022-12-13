import { useEffect } from 'react'

import { Collapse }                                         from 'antd'
import { connect, TooltipComponentFormatterCallbackParams } from 'echarts'
import ReactECharts                                         from 'echarts-for-react'
import moment                                               from 'moment-timezone'
import { renderToString }                                   from 'react-dom/server'
import { useIntl }                                          from 'react-intl'

import {
  mapCodeToFailureText,
  clientEventDescription
} from '@acx-ui/analytics/utils'
import { SingleLineScatterChart } from '@acx-ui/components'
import { useDateFilter }          from '@acx-ui/utils'
import { formatter }              from '@acx-ui/utils'


import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, TYPES, DisplayEvent } from './config'
import { ClientInfoData, ConnectionEvent }                                                                       from './services'
import * as UI                                                                                                   from './styledComponents'

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
  category: string
}

 type TimelineData = {
  connectionEvents :{
   [SUCCESS]: Event[] | [];
   [FAILURE]: Event[] | [];
   [DISCONNECT]: Event[] | [];
   [SLOW]: Event[] | [];
   allEvents: Event[] | [];
 }
 }
const getTimelineData = (events: Event[]) =>
  events.reduce(
    (acc, event) => {
      if (event.type === TYPES.CONNECTION_EVENTS) {
        acc['connectionEvents']['allEvents'] = [...acc['connectionEvents']['allEvents'], event]
        if (event.category === SUCCESS)
          acc['connectionEvents'][SUCCESS] = [...acc['connectionEvents'][SUCCESS], event]
        if (event.category === FAILURE)
          acc['connectionEvents'][FAILURE] = [...acc['connectionEvents'][FAILURE], event]
        if (event.category === DISCONNECT)
          acc['connectionEvents'][DISCONNECT] = [...acc['connectionEvents'][DISCONNECT], event]
        if (event.category === SLOW)
          acc['connectionEvents'][SLOW] = [...acc['connectionEvents'][SLOW], event]
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
  const TimelineData = getTimelineData(events)
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'timeSeriesGroup'
    }
  }
  const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
    const evtObj = Array.isArray(params) && Array.isArray(params[0].data) ? params[0].data[2] : ''
    const { code, apName, mac, radio, state, event } = evtObj as unknown as DisplayEvent
    const ap = [apName, mac ? `(${mac})` : ''].filter(Boolean).join(' ')
    const tooltipText = [
      code ? `${mapCodeToFailureText(code, intl)}:` : '',
      `${intl.$t(clientEventDescription(event,state))} @`,
      `${ap} ${formatter('radioFormat')(radio)}`
    ].filter(Boolean).join(' ')

    return renderToString(
      <UI.TooltipWrapper>
        {tooltipText}
      </UI.TooltipWrapper>
    )
  }
  useEffect(() => { connect('timeSeriesGroup') }, [])
  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [moment(startDate).valueOf() , moment(endDate).valueOf() ]
  return (
    <UI.CollapseBox
      expandIcon={({ isActive }) =>
        isActive ? (
          <UI.StyledMinusSquareOutlined />
        ) : (
          <UI.StyledPlusSquareOutlined />
        )
      }
      ghost>
      {ClientTroubleShootingConfig.timeLine.map((config, index) => (
        <Panel
          header={
            <UI.TimelineTitle
              onClick={(event) => event.stopPropagation()}>
              {config?.chartType === 'scatter' ? (
                <SingleLineScatterChart
                  style={{ width: 850, marginBottom: 8 }}
                  data={
                    TimelineData[config.value as keyof TimelineData][
                      'allEvents'
                    ]
                  }
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(config.title)}
                  count={
                    TimelineData[config.value as keyof TimelineData][
                      'allEvents'
                    ].length
                  }
                  tooltopEnabled
                  tooltipFormatter={tooltipFormatter}
                  onDotClick={() => {}}
                  mapping={config.chartMapping}
                />
              ) : (
                $t(config.title)
              )}
            </UI.TimelineTitle>
          }
          key={index}>
          <UI.TimelineSubContent>
            {config?.subtitle?.map((subtitle, index) =>
              subtitle?.chartType === 'scatter' ? (
                <SingleLineScatterChart
                  style={{ width: 850, marginBottom: 4 }}
                  data={
                    TimelineData[config.value as keyof TimelineData][
                      subtitle.value as keyof TimelineData['connectionEvents']
                    ]
                  }
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(subtitle.title)}
                  count={
                    TimelineData[config.value as keyof TimelineData][
                      subtitle.value as keyof TimelineData['connectionEvents']
                    ].length
                  }
                  key={index}
                  tooltipFormatter={tooltipFormatter}
                  tooltopEnabled
                  onDotClick={() => {}}
                  mapping={subtitle.chartMapping}
                />
              ) : (
                $t(subtitle.title)
              )
            )}
          </UI.TimelineSubContent>
        </Panel>
      ))}
    </UI.CollapseBox>
  )
}