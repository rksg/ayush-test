import { scalePow }                                  from 'd3-scale'
import ReactECharts                                  from 'echarts-for-react'
import _                                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { cssNumber, cssStr } from '../../theme/helper'
import { graphStyles }       from '../CloudRRMGraph'

interface NodeSize {
  max: number
  min: number
}

interface NeighborAPGraphProps {
  title: string
  subtext?: string
  nodeSize: NodeSize
  nodes: Record<'nonInterfering'|'interfering'|'rogue', number>
  width: number
  height: number
}

const genericLabel = {
  show: true,
  position: 'inside',
  color: cssStr('--acx-primary-white'),
  fontWeight: cssNumber('--acx-subtitle-4-font-weight'),
  fontSize: cssNumber('--acx-body-2-font-size')
}

const nodeTypes: Record<string, { name: MessageDescriptor, color: string }> = {
  root: {
    name: defineMessage({ defaultMessage: 'AP' }),
    color: cssStr('--acx-neutrals-50')
  },
  nonInterfering: {
    name: defineMessage({ defaultMessage: 'Non-Interfering AP' }),
    color: cssStr('--acx-accents-blue-50')
  },
  interfering: {
    name: defineMessage({ defaultMessage: 'Co-Channel Interfering AP' }),
    color: cssStr('--acx-semantics-red-50')
  },
  rogue: {
    name: defineMessage({ defaultMessage: 'Rogue AP' }),
    color: cssStr('--acx-neutrals-80')
  }
}

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const { $t } = useIntl()
  const { nodeSize, nodes, width, height } = props
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
    name: $t(nodeTypes[key].name),
    symbolSize: scale(value),
    itemStyle: { color: nodeTypes[key].color },
    label: {
      ...genericLabel,
      formatter: $t({ defaultMessage: '{value, number, -}' }, { value })
    }
  })).value()

  const links = Object.keys(nodes).map(key => ({
    source: $t(nodeTypes.root.name),
    target: $t(nodeTypes[key].name),
    lineStyle: { color: cssStr('--acx-neutrals-50'), width: 2 }
  }))

  const option = {
    backgroundColor: cssStr('--acx-neutrals-10'),
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
        repulsion: width * 4.5,
        initLayout: 'circular'
      },
      emphasis: { focus: 'none' }
    }]
  }

  return <ReactECharts option={option} style={{ width, height }} />
}

export default NeighborAPGraph
