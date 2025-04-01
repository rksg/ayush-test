import { scalePow } from 'd3-scale'
import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'

import { cssNumber, cssStr } from '../../theme/helper'

interface NodeSize {
  max: number
  min: number
}

interface RootNode {
  name: string;
  color: string;
}

export interface Node {
  name: string;
  value: number;
  color: string;
}

interface NeighborAPGraphProps {
  title: string
  subtext?: string
  nodeSize: NodeSize
  root: RootNode
  nodes: Node[]
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

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const { $t } = useIntl()
  const { nodeSize, root, nodes, width, height } = props
  const max = Math.max(...nodes.map(node => node.value))
  const scale = scalePow()
    .exponent(0.75)
    .domain([max * .05, max])
    .range([nodeSize.min, nodeSize.max])
    .clamp(true)

  const rootNode = {
    name: root.name,
    category: 'center',
    symbolSize: nodeSize.min,
    itemStyle: { color: root.color },
    fixed: true,
    label: {
      ...genericLabel,
      formatter: root.name
    }
  }

  const graphNodes = nodes.filter(node => node.value !== 0).map(node => ({
    name: node.name,
    symbolSize: scale(node.value),
    itemStyle: { color: node.color },
    label: {
      ...genericLabel,
      formatter: $t({ defaultMessage: '{value, number, -}' }, { value: node.value })
    }
  }))

  const links = nodes.map(node => ({
    source: root.name,
    target: node.name,
    lineStyle: { color: cssStr('--acx-neutrals-50'), width: 2 }
  }))

  const option = {
    backgroundColor: cssStr('--acx-neutrals-10'),
    title: {
      text: props.title,
      textStyle: {
        color: cssStr('--acx-primary-black'),
        fontFamily: cssStr('--acx-neutral-brand-font'),
        fontSize: cssNumber('--acx-subtitle-4-font-size'),
        lineHeight: cssNumber('--acx-subtitle-4-line-height'),
        fontWeight: cssNumber('--acx-subtitle-4-font-weight')
      },
      ...(props.subtext ? {
        subtext: props.subtext,
        subtextStyle: {
          color: cssStr('--acx-primary-black'),
          fontFamily: cssStr('--acx-neutral-brand-font'),
          fontSize: cssNumber('--acx-body-4-font-size'),
          lineHeight: cssNumber('--acx-body-4-line-height'),
          fontWeight: cssNumber('--acx-body-font-weight'),
          overflow: 'break'
        }
      } : {}),
      itemGap: 3,
      top: 15,
      left: 15
    },
    series: [{
      type: 'graph',
      layout: 'force',
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
