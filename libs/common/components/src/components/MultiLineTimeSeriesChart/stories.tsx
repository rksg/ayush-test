import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'
import { connect }          from 'echarts'
import ReactECharts         from 'echarts-for-react'

import { TimeStamp } from '@acx-ui/types'

import { Button } from '../Button'

import { MultiLineTimeSeriesChart } from '.'


const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 3000]]

  for (let i = 1; i < 37; i++) {
    // eslint-disable-next-line max-len
    const value = Math.round((Math.random()-0.5) * 250 + data[i - 1][1])
    const displayValue = (Math.random() > 0.20) ? value : null
    data.push([base + oneDay * i, displayValue as number])
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
  const [data, setData]= useState(getSeriesData())
  const chartRef1 = useRef<ReactECharts>(null)
  const chartRef2 = useRef<ReactECharts>(null)
  const chartRefs = useMemo(() => [chartRef1, chartRef2],[])
  const n = data.length
  const timeWindowInit = (data: {
    name: string;
    data: [TimeStamp, number][];
}[]) => [data[0].data[0][0], data[n-1].data[n-1][0]]
  const [timeWindow, setTimeWindow] = useState(timeWindowInit(data))

  const connectRefs = useCallback(() => {
    const validRefs = chartRefs.filter(ref => ref && ref.current)
    validRefs.forEach(ref => {
      let instance = ref.current!.getEchartsInstance()
      instance.group = 'group1'
    })
    connect('group1')
  }, [chartRefs])


  useEffect(()=>{
    connectRefs()
  }, [connectRefs])

  const onBrushChangeCallback = useCallback((range: TimeStamp[]) => {    
    if (range[0] !== timeWindow[0]) {
      setTimeWindow(range)
      connectRefs()
    }

    if (range[1] !== timeWindow[1]) {
      setTimeWindow(range)
      connectRefs()
    }
  }, [timeWindow, connectRefs])

  return (
    <>
      <Button
        size='small'
        type='primary'
        onClick={()=>{
          const copyData = getSeriesData()
          setData(copyData) 
          setTimeWindow(timeWindowInit(copyData))
          connectRefs()
        }}>Update Data</Button>
      {chartRefs.map((ref, index) => <MultiLineTimeSeriesChart
        key={index}
        chartRef={ref}
        style={{ width: 504, height: 300 }}
        data={data}
        brush={timeWindow as [TimeStamp, TimeStamp]}
        onBrushChange={onBrushChangeCallback}
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
  .add('With Marked Areas', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
    markers={[{
      startTime: +new Date('2020-11-01T00:00:00.000Z'),
      endTime: +new Date('2020-11-05T00:00:00.000Z'),
      data: { id: 1 },
      itemStyle: { opacity: 0.2, color: '#FF0000' }
    }, {
      startTime: +new Date('2020-11-20T00:00:00.000Z'),
      endTime: +new Date('2020-11-30T00:00:00.000Z'),
      data: { id: 1 },
      itemStyle: { opacity: 0.2, color: '#0000FF' }
    }]}
    // eslint-disable-next-line no-console
    onMarkedAreaClick={(data) => { console.log(data) }}
  />)
  .add('With Brush', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
    brush={['2020-11-10', '2020-11-20']}
    onBrushChange={range => {console.log(range.map(r=>new Date(r).toISOString()))}} // eslint-disable-line no-console
  />)
  .add('Connected Chart', () => <ConnectedCharts />)
  .add('With Knobs', () =>
    <div style={{ width: 504, height: 278, padding: 10, border: '1px solid lightgray' }}>
      <MultiLineTimeSeriesChart
        style={{ height: 190 }}
        data={object('data', getSeriesData())}
      />
    </div>)
