import { storiesOf } from '@storybook/react'

import { nodeSize, sampleData } from './__tests__/fixtures'

import { NeighborAPGraph } from '.'


storiesOf('Neighbor APGraph', module)
  .add('Default Graph', () => (
    <NeighborAPGraph
      title='Default Graph'
      data={sampleData}
      nodeSize={nodeSize}
    />
  ))
  .add('Graph with additional Nodes', () => {
    const extraNodes = {
      nodes: [
        ...sampleData.nodes, { name: 'New AP', value: 8, category: 'non-interfering', key: '8' }],
      links: [...sampleData.links, { source: 'AP', target: 'New AP' }]
    }
    return <NeighborAPGraph
      title='Graph with More Nodes'
      data={extraNodes}
      nodeSize={nodeSize}
    />
  })
  .add('Graph with Subtext', () => (
    <NeighborAPGraph
      title='Default Graph'
      subtext='Subtext'
      data={sampleData}
      nodeSize={nodeSize}
    />
  ))
