import { storiesOf } from '@storybook/react'

import { nodes, nodeSize, nodesWithZeroValue, rootNode } from './__tests__/fixtures'

import { NeighborAPGraph } from '.'

storiesOf('Neighbor APGraph', module)
  .add('Default Graph', () => (
    <NeighborAPGraph
      title='Default Graph'
      nodeSize={nodeSize}
      root={rootNode}
      nodes={nodes}
    />
  ))
  .add('Graph with less Nodes', () => (
    <NeighborAPGraph
      title='Graph with More Nodes'
      nodeSize={nodeSize}
      root={rootNode}
      nodes={nodesWithZeroValue}
    />
  ))
  .add('Graph with Subtext', () => (
    <NeighborAPGraph
      title='Default Graph'
      subtext='Subtext'
      nodeSize={nodeSize}
      root={rootNode}
      nodes={nodes}
    />
  ))
