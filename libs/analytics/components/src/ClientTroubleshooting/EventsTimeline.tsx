import { useEffect } from 'react'

import { Collapse } from 'antd'
import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'

import { SingleLineScatterChart } from '@acx-ui/components'
import { useDateFilter }          from '@acx-ui/utils'


import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, TYPES, formatEventDesc, eventColorByCategory } from './config'
import { ClientInfoData,ConnectionEvent }                                                                                                 from './services'
import * as UI                                                                                                                            from './styledComponents'

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
  // const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  //   const [ time ] = (Array.isArray(params)
  //     ? params[0].data : params.data) as [number]
  //   return renderToString(
  //     <TooltipWrapper>
  //       <time dateTime={new Date(time).toJSON()}>{formatter('dateTimeFormat')(time) as string}</time>
  //     </TooltipWrapper>
  //   )
  // }


export function TimeLine (props : TimeLineProps){
  const { $t } = useIntl()
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
  useEffect(() => { connect('timeSeriesGroup') }, [])
  const { startDate, endDate } = useDateFilter()
  const chartBoundary = [moment(startDate).valueOf() , moment(endDate).valueOf() ]
  return (
    <UI.CollapseBox
      bordered={false}
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
            <UI.TimelineTitle>
              {config?.chartType === 'scatter' ? (
                <SingleLineScatterChart
                  style={{ width: 850 }}
                  data={
                    TimelineData[config.value as keyof TimelineData][
                      'allEvents'
                    ]
                  }
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(config.title)}
                  count={TimelineData[config.value as keyof TimelineData][
                    'allEvents'
                  ].length}
                  tooltopEnabled
                  onDotClick={(params) => {
                    // eslint-disable-next-line no-console
                    console.log(params)
                  }}
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
                  style={{ width: 850 }}
                  data={
                    TimelineData[config.value as keyof TimelineData][
                      subtitle.value as keyof TimelineData['connectionEvents']
                    ]
                  }
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(subtitle.title)}
                  count={TimelineData[config.value as keyof TimelineData][
                    subtitle.value as keyof TimelineData['connectionEvents']
                  ].length}
                  key={index}
                  tooltopEnabled={false}
                  onDotClick={(params) => {
                    // eslint-disable-next-line no-console
                    console.log(params)
                  }}

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