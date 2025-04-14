import { storiesOf } from '@storybook/react'

import { nodes, nodeSize, nodesWithZeroValue } from './__tests__/fixtures'

import { NeighborAPGraph } from '.'

const base = 120
storiesOf('NeighborAPGraph', module)
  .add('Default Graph', () => (
    <NeighborAPGraph
      title='Default Graph'
      nodeSize={nodeSize}
      nodes={nodes}
      width={base * 3}
      height={base * 4}
    />
  ))
  .add('Graph with less Nodes', () => (
    <NeighborAPGraph
      title='Graph with More Nodes'
      nodeSize={nodeSize}
      nodes={nodesWithZeroValue}
      width={base * 3}
      height={base * 4}
    />
  ))
  .add('Graph with Subtext', () => (
    <NeighborAPGraph
      title='Default Graph'
      subtext='Subtext'
      nodeSize={nodeSize}
      nodes={nodes}
      width={base * 3}
      height={base * 4}
    />
  ))
