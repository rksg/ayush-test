import { useEffect, useState, useCallback } from 'react'

import { withKnobs,object } from '@storybook/addon-knobs'
import { storiesOf }        from '@storybook/react'
import { connect }          from 'echarts'
import ReactECharts         from 'echarts-for-react'

import { incidentSeverities }                from '@acx-ui/analytics/utils'
import type { MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'
import type { TimeStamp, TimeStampRange }    from '@acx-ui/types'

import { cssStr } from '../../theme/helper'
import { Button } from '../Button'

import { MultiLineTimeSeriesChart } from '.'

const getData = () => {
  const base = +new Date(2020, 9, 29)
  const oneDay = 24 * 3600 * 1000
  const data = [[base, Math.random() * 3000]]
  for (let i = 1; i < 37; i++) {
    const value = Math.round((Math.random()-0.5) * 250 + data[i - 1][1])
    const displayValue = (Math.random() > 0.20) ? value : null
    data.push([base + oneDay * i, displayValue as number])
  }
  return data as [TimeStamp, number][]
}
const seriesNames = [
  ['New Clients', 'Impacted Clients', 'Connected Clients'],
  ['Total Failures', 'EAP Failures', 'EAP Attempts']
]
export const getSeriesData = (index = 0) => {
  const series = []
  for (let i = 0; i < 3; i++) {
    series.push({
      name: seriesNames[index][i],
      data: getData()
    })
  }
  return series
}

const connectChart = (chart: ReactECharts | null) => {
  if (chart) {
    const instance = chart.getEchartsInstance()
    instance.group = 'group'
  }
}

const Connected = () => {
  useEffect(() => { connect('group') }, [])
  return (
    <>
      {Array(2).fill(undefined).map((_, i) => <MultiLineTimeSeriesChart
        key={i}
        chartRef={connectChart}
        style={{ width: 504, height: 300 }}
        data={getSeriesData(i)}
        zoom={['2020-11-10', '2020-11-20']}
        // eslint-disable-next-line no-console
        onDataZoom={(range) => { console.log(range.map(r => new Date(r).toISOString())) }}
      />)}
    </>
  )
}

const ConnectedBrush = () => {
  const [data, setData]= useState(getSeriesData())
  const n = data.length
  const timeWindowInit = (data: MultiLineTimeSeriesChartData[]) =>
    [data[0].data[0][0], data[n-1].data[n-1][0]]
  const [timeWindow, setTimeWindow] = useState(timeWindowInit(data))
  const onBrushChangeCallback = useCallback((range: TimeStamp[]) => {
    if (range[0] !== timeWindow[0] || range[1] !== timeWindow[1]) {
      setTimeWindow(range)
    }
  }, [timeWindow])
  useEffect(() => { connect('group') }, [])
  return (
    <>
      <Button
        size='small'
        type='primary'
        onClick={()=>{
          const copyData = getSeriesData()
          setData(copyData)
        }}
      >Update Data</Button>
      {Array(2).fill(undefined).map((_, i) => <MultiLineTimeSeriesChart
        key={i}
        chartRef={connectChart}
        style={{ width: 504, height: 300 }}
        data={data}
        brush={timeWindow as TimeStampRange}
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    onDataZoom={(range) => { console.log(range.map(r => new Date(r).toISOString())) }}
  />)

  .add('With Mark Areas', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
    markers={[{
      startTime: +new Date('2020-11-01T00:00:00.000Z'),
      endTime: +new Date('2020-11-05T00:00:00.000Z'),
      data: { id: 1 },
      itemStyle: { opacity: 0.3, color: cssStr(incidentSeverities.P1.color) }
    }, {
      startTime: +new Date('2020-11-07T00:00:00.000Z'),
      endTime: +new Date('2020-11-08:00:00.000Z'),
      data: { id: 2 },
      itemStyle: { opacity: 0.3, color: cssStr(incidentSeverities.P4.color) }
    }, {
      startTime: +new Date('2020-11-13T00:00:00.000Z'),
      endTime: +new Date('2020-11-15T00:00:00.000Z'),
      data: { id: 3 },
      itemStyle: { opacity: 1, color: cssStr(incidentSeverities.P1.color) }
    }, {
      startTime: +new Date('2020-11-20T00:00:00.000Z'),
      endTime: +new Date('2020-11-23T00:00:00.000Z'),
      data: { id: 4 },
      itemStyle: { opacity: 0.3, color: cssStr(incidentSeverities.P3.color) }
    }, {
      startTime: +new Date('2020-11-26T00:00:00.000Z'),
      endTime: +new Date('2020-11-30T00:00:00.000Z'),
      data: { id: 5 },
      itemStyle: { opacity: 0.3, color: cssStr(incidentSeverities.P2.color) }
    }]}
    // eslint-disable-next-line no-console
    onMarkAreaClick={(data) => { console.log(data) }}
  />)

  .add('With Brush', () => <MultiLineTimeSeriesChart
    style={{ width: 504, height: 300 }}
    data={getSeriesData()}
    brush={['2020-11-10', '2020-11-20']}
    // eslint-disable-next-line no-console
    onBrushChange={(range) => { console.log(range.map(r => new Date(r).toISOString())) }}
  />)

  .add('Connected', () => <Connected />)

  .add('Connected With Brush', () => <ConnectedBrush />)

  .add('With Knobs', () =>
    <div style={{ width: 480, height: 250, padding: 10, border: '1px solid lightgray' }}>
      <MultiLineTimeSeriesChart
        style={{ width: 460, height: 230 }}
        data={object('data', getSeriesData())}
        disableLegend
      />
    </div>
  )
