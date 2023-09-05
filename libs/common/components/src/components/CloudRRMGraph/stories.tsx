import { useEffect } from 'react'

import { storiesOf }               from '@storybook/react'
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

storiesOf('Graph', module)
  .add('with interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current'
      data={deriveInterfering(sample, Type.BandEnum._5_GHz)}
    />)
  .add('empty interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={deriveInterfering({ ...sample, interferingLinks: [] }, Type.BandEnum._5_GHz)}
    />)
  .add('no interferingLinks', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={deriveInterfering({ ...sample, interferingLinks: null }, Type.BandEnum._5_GHz)}
    />)
  .add('random', () =>
    <Graph
      chartRef={() => {}}
      title='Current value'
      subtext='ChannelFly for 5GHz'
      data={trimGraph(deriveInterfering(random, Type.BandEnum._5_GHz))}
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
        />
        <Graph
          chartRef={connectChart}
          title='Graph 2'
          subtext='subtext'
          data={graphs[1]}
        />
      </div>
    }
    return <Graphs />
  })
