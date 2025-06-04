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
    name: defineMessage({ defaultMessage: 'Avg. Non-Interfering APs' }),
    color: cssStr('--acx-accents-blue-50'),
    legendText: defineMessage({ defaultMessage: 'Avg. Non-Interfering APs' }),
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'Average number of APs operating on non-overlapping channels, helping to reduce interference and maintain optimal wireless performance.' })
  },
  [Node.Interfering]: {
    name: defineMessage({ defaultMessage: 'Avg. Co-Channel Interfering APs' }),
    color: cssStr('--acx-semantics-red-50'),
    legendText: defineMessage({ defaultMessage: 'Avg. Co-Channel Interfering APs' }),
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'Average number of APs operating on the same or overlapping channels, which may cause signal interference and degrade network performance.' })
  },
  [Node.Rogue]: {
    name: defineMessage({ defaultMessage: 'Avg. Rogue APs' }),
    color: cssStr('--acx-neutrals-80'),
    legendText: defineMessage({ defaultMessage: 'Rogue APs' }),
    // eslint-disable-next-line max-len
    tooltip: defineMessage({ defaultMessage: 'Average number of unauthorized or unidentified APs detected in the vicinity, which may pose security risks or cause network interference.' })
  }
} as Record<string, NodeType>

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const { $t } = useIntl()
  const { nodeSize, nodes, width, height, backgroundColor, zoom, repulsion } = props
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
      left: '17.5%',
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
