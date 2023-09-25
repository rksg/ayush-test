import { useEffect } from 'react'

import { storiesOf }               from '@storybook/react'
import { scalePow }                from 'd3-scale'
import { connect as connectGraph } from 'echarts'
import ReactECharts                from 'echarts-for-react'
import { flow }                    from 'lodash'

import {
  mockCloudRRMGraphData,
  sample,
  sampleGraphsForTxPower
}                                           from './__tests__/fixtures'
import {
  deriveInterferingGraphs,
  deriveInterfering,
  pairGraphs,
  deriveTxPowerHighlight,
  trimGraph
}                                           from './helper'
import * as Type from './type'

import { Graph } from './index'

const random = mockCloudRRMGraphData(Type.BandEnum._5_GHz, 800, 200, 100)
const zoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500, 750])
  .range([1.75, 0.6, 0.4, 0.35, 0.2, 0.15, 0.11, 0.09, 0.075, 0.06])

storiesOf('Graph', module)
  .add('with interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current'
      data={deriveInterfering(sample, Type.BandEnum._5_GHz)}
      zoomScale={zoomScale}
    />)
  .add('empty interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={deriveInterfering({ ...sample, interferingLinks: [] }, Type.BandEnum._5_GHz)}
      zoomScale={zoomScale}
    />)
  .add('no interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={deriveInterfering({ ...sample, interferingLinks: null }, Type.BandEnum._5_GHz)}
      zoomScale={zoomScale}
    />)
  .add('random', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={trimGraph(deriveInterfering(random, Type.BandEnum._5_GHz))}
      zoomScale={zoomScale}
    />)
  .add('paired', () => {
    const graphs = flow([deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight])(
      sampleGraphsForTxPower, Type.BandEnum._5_GHz)
    const Graphs = () => {
      const connectChart = (chart: ReactECharts | null) => {
        if (chart) {
          const instance = chart.getEchartsInstance()
          instance.group = 'graphGroup'
        }
      }
      useEffect(() => { connectGraph('graphGroup') }, [])
      return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Graph
          chartRef={connectChart}
          title='Graph 1'
          subtext='subtext'
          data={graphs[0]}
          zoomScale={zoomScale}
        />
        <Graph
          chartRef={connectChart}
          title='Graph 2'
          subtext='subtext'
          data={graphs[1]}
          zoomScale={zoomScale}
        />
      </div>
    }
    return <Graphs />
  })
