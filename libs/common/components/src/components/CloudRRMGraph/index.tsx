import { RefCallback, useImperativeHandle, useRef } from 'react'

import { scalePow }                        from 'd3-scale'
import ReactECharts, { EChartsReactProps } from 'echarts-for-react'
import PropTypes                           from 'prop-types'

import { cssStr }         from '../../theme/helper'
import { tooltipOptions } from '../Chart/helper'

import { categoryStyles, tooltipFormatter } from './helper'
import * as Type                            from './type'

const zoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.1])

const zoomFactor = scalePow()
  .exponent(3)
  .domain([0, 1, 10, 20])
  .range([0.9, 0.9, 1.3, 1.3])

const repulsionScale = scalePow()
  .exponent(1.1)
  .domain([0, 1, 10, 20])
  .range([500, 500, 8500, 8500])

export interface GraphProps extends Omit<EChartsReactProps, 'option' | 'opts' | 'style'>{
  chartRef: RefCallback<ReactECharts>
  data: Type.ProcessedCloudRRMGraph
  title: string
  subtext?: string
  style?: EChartsReactProps['style'] & { width?: number, height?: number }
}

export function Graph (props: GraphProps) {

  const highlightColor = cssStr('--acx-semantics-red-50')
  const normalColor = cssStr('--acx-neutrals-50')
  const blurColor = cssStr('--acx-neutrals-30')

  const eChartsRef = useRef<ReactECharts>(null)
  useImperativeHandle(props.chartRef, () => eChartsRef.current!)

  const { data: { nodes = [], links = [], categories = [] } } = props

  const linksNodeRatio = links.length / nodes.length || 1
  const zoom = zoomScale(nodes.length) * zoomFactor(linksNodeRatio)
  const repulsion = repulsionScale(linksNodeRatio)

  const option = {
    backgroundColor: cssStr('--acx-neutrals-10'),
    title: {
      text: props.title,
      textStyle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: cssStr('--acx-primary-black')
      },
      ...(props.subtext ? {
        subtext: props.subtext,
        subtextStyle: {
          fontWeight: 'lighter',
          fontSize: 12,
          color: cssStr('--acx-primary-black'),
          width: 500,
          overflow: 'break',
          lineHeight: 15
        }
      } : {}),
      itemGap: 5,
      top: 15,
      left: 15
    },
    color: props.data.categories?.map(category => categoryStyles[category.name].color),
    tooltip: {
      ...tooltipOptions(),
      position: 'top',
      formatter: tooltipFormatter
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        cursor: 'default',
        zoom,
        data: nodes.map(node => ({
          ...node,
          label: { show: false },
          itemStyle: {
            borderColor: cssStr('--acx-primary-white')
          },
          emphasis: {
            disabled: node.category === Type.CategoryState.Normal,
            itemStyle: { color: categoryStyles[node.category].emphasisColor }
          },
          blur: {
            itemStyle: {
              color: node.category === Type.CategoryState.Normal ? blurColor : normalColor
            }
          }
        })),
        links: links.map(link => ({
          ...link,
          cursor: 'default',
          label: { show: false },
          lineStyle: {
            type: categoryStyles[link.category].lineStyle.valueOf(),
            width: 2,
            color: link.category === Type.CategoryState.Normal ? normalColor : highlightColor
          },
          emphasis: { disabled: true },
          blur: { lineStyle: { color: blurColor } }
        })),
        categories: categories,
        roam: true,
        force: {
          layoutAnimation: false,
          repulsion,
          initLayout: 'circular'
        },
        emphasis: { focus: 'adjacency' }
      }
    ]
  }

  return <ReactECharts {...props} ref={eChartsRef} opts={{ renderer: 'svg' }} option={option} />
}

Graph.propTypes = {
  data: PropTypes.object,
  title: PropTypes.string,
  subtext: PropTypes.string,
  chartRef: PropTypes.func
}
