import { scalePow } from 'd3'
import ReactECharts from 'echarts-for-react'

import { cssNumber, cssStr } from '../../theme/helper'

export interface Node {
  name: string;
  value: number;
  category: string;
  key: string;
}

interface Link {
  source: string;
  target: string;
}

interface GraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
  title?: string;
}

const categoryColors: Record<string, string> = {
  'center': cssStr('--acx-neutrals-50'),
  'non-interfering': cssStr('--acx-accents-blue-50'),
  'co-channel': cssStr('--acx-semantics-red-50'),
  'rogue': cssStr('--acx-neutrals-80')
}

export interface ProcessedNeighborAPGraph {
  nodes: Node[]
  links: Link[]
}

interface NodeSize {
  max: number
  min: number
}

interface NeighborAPGraphProps extends GraphProps {
  data: ProcessedNeighborAPGraph
  title: string
  subtext?: string
  backgroundColor?: string
  nodeSize: NodeSize
}

const repulsionScale = scalePow()
  .exponent(1)
  .domain([0, 1, 10, 20])
  .range([1000, 2500, 8500, 8500])

export const NeighborAPGraph = (props: NeighborAPGraphProps) => {
  const {
    data: { nodes = [], links = [] },
    backgroundColor,
    nodeSize
  } = props

  const linksNodeRatio = links.length / nodes.length || 1
  const repulsion = repulsionScale(linksNodeRatio)

  const option = {
    backgroundColor: backgroundColor ?? cssStr('--acx-neutrals-10'),
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
        data: nodes.map(node => ({
          ...node,
          symbolSize: Math.max(Math.min(node.value * 10, nodeSize.max), nodeSize.min),
          itemStyle: {
            color: categoryColors[node.category]
          },
          label: {
            show: true,
            position: 'inside',
            formatter: node.key,
            color: cssStr('--acx-primary-white'),
            fontWeight: 'bold',
            fontSize: cssNumber('--acx-body-3-font-size')
          }
        })),
        links: links,
        roam: true,
        force: {
          layoutAnimation: false,
          repulsion,
          initLayout: 'circular'
        },
        emphasis: { focus: 'none' }
      }
    ]
  }

  return <ReactECharts option={option} />
}

export default NeighborAPGraph
