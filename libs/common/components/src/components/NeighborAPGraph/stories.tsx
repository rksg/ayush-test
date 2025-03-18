import { storiesOf } from '@storybook/react'

import { Graph } from '.'

const sampleData = {
  nodes: [
    { name: 'AP', value: 5, category: 'center', key: 'AP' },
    { name: 'Non-Interfering AP', value: 12, category: 'non-interfering', key: '12' },
    { name: 'Co-Channel Interfering AP', value: 5, category: 'co-channel', key: '5' },
    { name: 'Rogue AP', value: 10, category: 'rogue', key: '10' }
  ],
  links: [
    { source: 'AP', target: 'Non-Interfering AP' },
    { source: 'AP', target: 'Co-Channel Interfering AP' },
    { source: 'AP', target: 'Rogue AP' }
  ]
}

const nodeSize = {
  max: 150,
  min: 20
}

storiesOf('Neighbor APGraph', module)
  .add('Default Graph', () => (
    <Graph
      title='Default Graph'
      data={sampleData}
      nodeSize={nodeSize}
      chartRef={() => {}}
    />
  ))
  .add('Graph with additional Nodes', () => {
    const extraNodes = {
      nodes: [
        ...sampleData.nodes, { name: 'New AP', value: 8, category: 'non-interfering', key: '8' }],
      links: [...sampleData.links, { source: 'AP', target: 'New AP' }]
    }
    return <Graph
      title='Graph with More Nodes'
      data={extraNodes}
      chartRef={() => {}}
      nodeSize={nodeSize}
    />
  })
