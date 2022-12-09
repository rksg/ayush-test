import { useEffect } from 'react'

import { Collapse } from 'antd'
import { connect }  from 'echarts'
import ReactECharts from 'echarts-for-react'
import moment       from 'moment-timezone'
import { useIntl }  from 'react-intl'

import { SingleLineScatterChart } from '@acx-ui/components'
import { useDateFilter }          from '@acx-ui/utils'

import { ClientTroubleShootingConfig, SUCCESS, FAILURE, SLOW, DISCONNECT, transformEvents, DisplayEvent, TYPES } from './config'
import { ClientInfoData,ConnectionEvent }                                                                        from './services'
import * as UI                                                                                                   from './styledComponents'

import { Filters } from '.'

const { Panel } = Collapse
type TimeLineProps = {
  data?: ClientInfoData,
  filters: Filters
}
 type TimelineData = {
  category :{
   [SUCCESS]: DisplayEvent[] | [];
   [FAILURE]: DisplayEvent[] | [];
   [DISCONNECT]: DisplayEvent[] | [];
   [SLOW]: DisplayEvent[] | [];
   allEvents: DisplayEvent[] | [];
 }
 }
const getTimelineData = (events: DisplayEvent[]) =>
  events.reduce(
    (acc, event) => {
      if (event.type === TYPES.CONNECTION_EVENTS) {
        acc['category']['allEvents'] = [...acc['category']['allEvents'], event]
        if (event.category === SUCCESS)
          acc['category'][SUCCESS] = [...acc['category'][SUCCESS], event]
        if (event.category === FAILURE)
          acc['category'][FAILURE] = [...acc['category'][FAILURE], event]
        if (event.category === DISCONNECT)
          acc['category'][DISCONNECT] = [...acc['category'][DISCONNECT], event]
        if (event.category === SLOW)
          acc['category'][SLOW] = [...acc['category'][SLOW], event]
      }
      return acc
    },
    {
      category: {
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
  const { data, filters } = props
  const types = filters ? filters.type ?? [] : []
  const radios = filters ? filters.radio ?? [] : []
  const events = transformEvents(
    data?.connectionEvents as ConnectionEvent[],
    types,
    radios
  ) as DisplayEvent[]
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
  const sampleData = new Array((chartBoundary[1] - chartBoundary[0])/(12 * 60 * 60 * 1000))
    .fill(0).map((_,index)=>({
      id: index,
      timestamp: `${chartBoundary[0] + 12 * 60 * 60 * 1000 * index}`,
      type: 'ap',
      name: 'name',
      key: 'key',
      oldValues: [ 'oldValues' ],
      newValues: [ 'newValues' ]
    }))
  console.log(TimelineData)
  console.log(sampleData)

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
              { config?.chartType === 'scatter'
                ? <SingleLineScatterChart
                  style={{ width: 850 }}
                  data={sampleData}
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(config.title)}
                  count={8}
                  onDotClick={(params)=>{
                  // eslint-disable-next-line no-console
                    console.log(params)
                  }}/>
                : $t(config.title)
              }
            </UI.TimelineTitle>}
          key={index}>
          <UI.TimelineSubContent>
            {config?.subtitle?.map((subtitle, index) =>
              subtitle?.chartType === 'scatter'
                ? <SingleLineScatterChart
                  style={{ width: 850 }}
                  data={sampleData}
                  chartBoundary={chartBoundary}
                  chartRef={connectChart}
                  title={$t(subtitle.title)}
                  count={8}
                  key={index}
                  onDotClick={(params)=>{
                    // eslint-disable-next-line no-console
                    console.log(params)
                  }}/>
                : $t(subtitle.title))
            }
          </UI.TimelineSubContent>
        </Panel>
      ))}
    </UI.CollapseBox>
  )
}