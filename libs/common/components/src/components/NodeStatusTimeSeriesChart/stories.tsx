import React, { ReactNode } from 'react'

import { storiesOf } from '@storybook/react'

import { Card } from '../Card'

import { NodeStatusTimeSeriesChart, NodeStatusData } from './index'

// Create sample data
const now = Date.now()
const hour = 3600 * 1000
const day = 24 * hour

storiesOf('NodeStatusTimeSeriesChart', module)
  .add('NodeStatusTimeSeriesChart', () => wrapInsideCard('Top Switches by Traffic',
    <NodeStatusTimeSeriesChart
      nodes={sampleNodes}
      chartBoundary={[now - day, now]}
      hasXaxisLabel
    />))

// generate sample data
const createNodeData = (nodeId: string, nodeName: string): NodeStatusData => {
  return {
    nodeId,
    nodeName,
    nodeLink: '/?path=/story/multibartimeserieschart--chart-view',

    data: [
      // Connected periods - green
      [now - 22 * hour, nodeId, now - 21 * hour, 1, '#4CAF50'],
      [now - 19 * hour, nodeId, now - 16 * hour, 1, '#4CAF50'],
      [now - 14 * hour, nodeId, now - 14.5 * hour, 1, '#4CAF50'],
      [now - 12 * hour, nodeId, now - 8 * hour, 1, '#4CAF50'],
      [now - 4 * hour, nodeId, now, 1, '#4CAF50'],
      // Disconnected periods - red
      [now- 24 * hour, nodeId, now- 23 * hour, 0, '#F1F1F1'],
      [now - 21 * hour, nodeId, now - 19 * hour, 0, '#F44336'],
      [now - 16 * hour, nodeId, now - 15 * hour, 0, '#F44336'],
      [now - 14.5 * hour, nodeId, now - 12 * hour, 0, '#F44336'],
      [now - 8 * hour, nodeId, now - 4 * hour, 0, '#F44336']
    ]
  }
}

// generate alternative data pattern
const createAlternativeNodeData = (nodeId: string, nodeName: string): NodeStatusData => {
  return {
    nodeId,
    nodeName,
    nodeLink: '/?path=/story/multibartimeserieschart--chart-view',
    data: [
      // Connected periods - green (different pattern)
      [now - 23 * hour, nodeId, now - 20 * hour, 1, '#4CAF50'],
      [now - 18 * hour, nodeId, now - 17 * hour, 1, '#4CAF50'],
      [now - 15 * hour, nodeId, now - 11 * hour, 1, '#4CAF50'],
      [now - 8 * hour, nodeId, now - 6 * hour, 1, '#4CAF50'],
      [now - 3 * hour, nodeId, now - 1 * hour, 1, '#4CAF50'],
      // Disconnected periods - red (different pattern)
      [now - 24 * hour, nodeId, now - 23 * hour, 0, '#F1F1F1'],
      [now - 20 * hour, nodeId, now - 18 * hour, 0, '#F44336'],
      [now - 17 * hour, nodeId, now - 15 * hour, 0, '#F44336'],
      [now - 11 * hour, nodeId, now - 8 * hour, 0, '#F44336'],
      [now - 6 * hour, nodeId, now - 3 * hour, 0, '#F44336'],
      [now - 1 * hour, nodeId, now, 0, '#F44336']
    ]
  }
}

// Sample nodes data
const sampleNodes: NodeStatusData[] = [
  createNodeData('edge-aaa', 'Node 1: Edge-AAA')
  // createAlternativeNodeData('edge-bbb', 'Node 2: Edge-BBB'),
  // createNodeData('edge-ccc', 'Node 3: Edge-CCC'),
  // createAlternativeNodeData('edge-ddd', 'Node 4: Edge-DDD')
]

{/* <Card title={title} style={{ overflow: 'visible' }}>
{children}
</Card> */}
const wrapInsideCard = (title: string, children: ReactNode) => (
  <div style={{ width: 800, height: 200, padding: '100px 50px' }}>

    <div style={{ width: '100%', height: 150, overflow: 'visible' }}>
      {children}
    </div>
    <div style={{ height: 100, width: '100%', backgroundColor: 'yellow' }}/>
  </div>)