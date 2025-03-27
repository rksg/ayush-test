import ReactECharts from 'echarts-for-react'

import { cssNumber, cssStr } from '../../theme/helper'

interface NodeSize {
  max: number
  min: number
}

interface RootNode {
  label: string;
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
}

const genericLabel = {
  show: true,
  position: 'inside',
  color: cssStr('--acx-primary-white'),
  fontWeight: cssNumber('--acx-subtitle-4-font-weight'),
  fontSize: cssNumber('--acx-body-2-font-size')
}

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const {
    nodeSize,
    root,
    nodes
  } = props

  const rootNode = {
    name: root.label,
    category: 'center',
    symbolSize: ((nodeSize.min + nodeSize.max) / 3),
    itemStyle: { color: root.color },
    fixed: true,
    label: {
      ...genericLabel,
      formatter: root.label
    }
  }

  const graphNodes = nodes.filter(node => node.value !== 0).map(node => ({
    name: node.name,
    symbolSize: Math.max(Math.min(node.value * 10, nodeSize.max), nodeSize.min),
    itemStyle: { color: node.color },
    label: {
      ...genericLabel,
      formatter: JSON.stringify(node.value)
    }
  }))

  const links = nodes.map(node => ({
    source: root.label,
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
          width: 500,
          overflow: 'break'
        }
      } : {}),
      itemGap: 3,
      top: 15,
      left: 15
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: [rootNode, ...graphNodes],
        links,
        roam: true,
        force: {
          layoutAnimation: false,
          repulsion: 1500,
          initLayout: 'circular'
        },
        emphasis: { focus: 'none' }
      }
    ]
  }

  return <ReactECharts option={option} />
}

export default NeighborAPGraph
