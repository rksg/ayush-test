import { useEffect, useMemo, useRef } from 'react'

import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'
import { connect }          from 'echarts'
import ReactECharts         from 'echarts-for-react'

import { TimeStamp } from '@acx-ui/types'


import { MultiLineTimeSeriesChart } from '.'


const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 3000]]

  for (let i = 1; i < 37; i++) {
    data.push([base + oneDay * i, Math.round((Math.random()-0.5) * 250 + data[i - 1][1])])
  }
  return data as [TimeStamp, number][]
}

const seriesNames = ['New Clients', 'Impacted Clients', 'Connected Clients']

export const getSeriesData = () => {
  const series = []
  for (let i = 0; i < 3; i++) {
    series.push({
      name: seriesNames[i],
      data: getData()
    })
  }
  return series
}

const ConnectedCharts = () => {
  const chartRef1 = useRef<ReactECharts>(null)
  const chartRef2 = useRef<ReactECharts>(null)
  const chartRefs = useMemo(() => [chartRef1, chartRef2],[])
  useEffect(()=>{
    if(chartRefs.every(ref => ref && ref.current)){
      [chartRefs[0], chartRefs[1]].forEach(ref => {
        let instance = ref.current!.getEchartsInstance()
        instance.group = 'group1'
      })
      connect('group1')
    }
  }, [chartRefs])
  return (
    <>
      {chartRefs.map((ref, index) => <MultiLineTimeSeriesChart
        key={index}
        chartRef={ref}
        style={{ width: 504, height: 300 }}
        data={getSeriesData()}
      />)}
    </>
  )
}

storiesOf('MultiLineTimeSeriesChart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
  />)
  .add('With Brush', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
    brush={['2020-11-10', '2020-11-20']}
    onBrushChange={ranges => {console.log(ranges.map(r=>new Date(r).toISOString()))}} // eslint-disable-line no-console
  />)
  .add('Connected Chart', () => <ConnectedCharts/>)
  .add('With Knobs', () =>
    <div style={{ width: 504, height: 278, padding: 10, border: '1px solid lightgray' }}>
      <MultiLineTimeSeriesChart
        style={{ height: 190 }}
        data={object('data', getSeriesData())}
      />
    </div>)
