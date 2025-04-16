import { scalePow }                                  from 'd3-scale'
import ReactECharts                                  from 'echarts-for-react'
import _                                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { formatter } from '@acx-ui/formatter'

import { cssNumber, cssStr } from '../../theme/helper'
import { graphStyles }       from '../CloudRRMGraph'

interface NodeSize {
  max: number
  min: number
}

export type NeighborAPNodes = Record<'nonInterfering'|'interfering'|'rogue', number>

interface NeighborAPGraphProps {
  title: string
  subtext?: string
  nodeSize: NodeSize
  nodes: NeighborAPNodes
  width: number
  height: number
  backgroundColor?: string
  zoom?: number
  repulsion?: number
  leftOffset?: string
}

const genericLabel = {
  show: true,
  position: 'inside',
  color: cssStr('--acx-primary-white'),
  fontWeight: cssNumber('--acx-subtitle-4-font-weight'),
  fontSize: cssNumber('--acx-body-2-font-size')
}

type NodeType = {
  name: MessageDescriptor
  color: string
  legendText?: MessageDescriptor | null
  tooltip: MessageDescriptor | null
}

enum Node {
  Root = 'root',
  NonInterfering = 'nonInterfering',
  Interfering = 'interfering',
  Rogue = 'rogue'
}

export const nodeTypes = {
  [Node.Root]: {
    name: defineMessage({ defaultMessage: 'AP' }),
    color: cssStr('--acx-neutrals-50'),
    legendText: null,
    tooltip: null
  },
  [Node.NonInterfering]: {
    name: defineMessage({ defaultMessage: 'Non-Interfering AP' }),
    color: cssStr('--acx-accents-blue-50'),
    legendText: defineMessage({ defaultMessage: 'Non-Interfering AP' }),
    tooltip: defineMessage(
      { defaultMessage: 'APs on different channels that minimize interference.' })
  },
  [Node.Interfering]: {
    name: defineMessage({ defaultMessage: 'Co-Channel Interfering AP' }),
    color: cssStr('--acx-semantics-red-50'),
    legendText: defineMessage({ defaultMessage: 'Co-Channel Interfering AP' }),
    tooltip: defineMessage(
      { defaultMessage: 'APs operating on the same channel, potentially causing interference.' })
  },
  [Node.Rogue]: {
    name: defineMessage({ defaultMessage: 'Rogue AP' }),
    color: cssStr('--acx-neutrals-80'),
    legendText: defineMessage({ defaultMessage: 'Rogue AP' }),
    tooltip: defineMessage({ defaultMessage: 'Unauthorized or unknown APs detected.' })
  }
} as Record<string, NodeType>

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const { $t } = useIntl()
  const { nodeSize, nodes, width, height, backgroundColor, zoom, repulsion, leftOffset } = props
  const max = Math.max(...Object.values(nodes))
  const scale = scalePow()
    .exponent(0.75)
    .domain([max * .05, max])
    .range([nodeSize.min, nodeSize.max])
    .clamp(true)

  const rootNode = {
    name: $t(nodeTypes.root.name),
    category: 'center',
    symbolSize: nodeSize.min,
    itemStyle: { color: nodeTypes.root.color },
    fixed: true,
    label: {
      ...genericLabel,
      formatter: $t(nodeTypes.root.name)
    }
  }

  const graphNodes = _(nodes).pickBy(value => value !== 0).toPairs().map(([key, value]) => ({
    name: $t(nodeTypes[key as Node].name),
    symbolSize: scale(value),
    itemStyle: { color: nodeTypes[key as Node].color },
    label: {
      ...genericLabel,
      formatter: formatter('countFormat')(value)
    }
  })).value()

  const links = Object.keys(nodes).map(key => ({
    source: $t(nodeTypes.root.name),
    target: $t(nodeTypes[key as Node].name),
    lineStyle: { color: cssStr('--acx-neutrals-50'), width: 2 }
  }))

  const option = {
    backgroundColor: backgroundColor ?? cssStr('--acx-neutrals-10'),
    title: {
      text: props.title,
      textStyle: graphStyles.textStyle,
      ...(props.subtext ? {
        subtext: props.subtext,
        subtextStyle: graphStyles.subtextStyle
      } : {}),
      ...graphStyles.positionStyles
    },
    series: [{
      type: 'graph',
      layout: 'force',
      cursor: 'default',
      zoom: zoom ?? 1,
      data: [rootNode, ...graphNodes],
      links,
      top: '20%',
      left: leftOffset ?? '25%',
      center: ['50%', '50%'],
      width: '50%',
      height: '50%',
      roam: false,
      force: {
        layoutAnimation: false,
        repulsion: width * (repulsion ?? 4.5),
        initLayout: 'circular'
      },
      emphasis: { focus: 'none' }
    }]
  }

  return <ReactECharts option={option} style={{ width, height }} />
}

export default NeighborAPGraph
