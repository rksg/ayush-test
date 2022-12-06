import { Collapse } from 'antd'
import { useIntl }  from 'react-intl'

import { SingleLineScatterChart } from '@acx-ui/components'

import { ClientTroubleShootingConfig }    from './config'
import { transformEvents }                from './config'
import { ClientInfoData,ConnectionEvent } from './services'
import * as UI                            from './styledComponents'

import { Filters } from '.'

const types = ['ap']
const chartBoundary = [1654423052112, 1657015052112]
const sampleData = new Array((chartBoundary[1] - chartBoundary[0])/(12 * 60 * 60 * 1000))
  .fill(0).map((_,index)=>({
    id: index,
    timestamp: `${chartBoundary[0] + 12 * 60 * 60 * 1000 * index}`,
    type: types[Math.round((Math.random()*100)%4)],
    name: 'name',
    key: 'key',
    oldValues: [ 'oldValues' ],
    newValues: [ 'newValues' ]
  }))
const { Panel } = Collapse
type TimeLineProps = {
  data?: ClientInfoData,
  filters: Filters
}
export function TimeLine (props : TimeLineProps){
  const { $t } = useIntl()
  const { data, filters } = props
  console.log(data)
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
        <Panel header={<UI.TimelineTitle>
          <SingleLineScatterChart
            style={{ width: 850 }}
            data={sampleData}
            chartBoundary={chartBoundary}
            title={$t(config.title)}
            count={8}
            onDotClick={(params)=>{
              // eslint-disable-next-line no-console
              console.log(params)
            }}/></UI.TimelineTitle>}
        key={index}>
          <UI.TimelineSubContent>
            <SingleLineScatterChart
              style={{ width: 850 }}
              data={sampleData}
              chartBoundary={chartBoundary}
              title={'Success'}
              count={8}
              onDotClick={(params)=>{
              // eslint-disable-next-line no-console
                console.log(params)
              }}/>
            <SingleLineScatterChart
              style={{ width: 850 }}
              data={sampleData}
              chartBoundary={chartBoundary}
              title={'Failure'}
              count={8}
              onDotClick={(params)=>{
              // eslint-disable-next-line no-console
                console.log(params)
              }}/>
            <SingleLineScatterChart
              style={{ width: 850 }}
              data={sampleData}
              chartBoundary={chartBoundary}
              title={'Slow'}
              count={8}
              onDotClick={(params)=>{
              // eslint-disable-next-line no-console
                console.log(params)
              }}/>
            <SingleLineScatterChart
              style={{ width: 850 }}
              data={sampleData}
              chartBoundary={chartBoundary}
              title={'Disconnect'}
              count={8}
              onDotClick={(params)=>{
              // eslint-disable-next-line no-console
                console.log(params)
              }}/>
          </UI.TimelineSubContent>
        </Panel>
      ))}
    </UI.CollapseBox>
  )
}