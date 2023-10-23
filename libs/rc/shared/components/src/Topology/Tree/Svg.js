import React, { useEffect, useRef, useMemo } from 'react'

import { select, tree, zoom } from 'd3'

import Links from './Links'
import Nodes from './Nodes'

const NODE_SIZE = [45, 150]
const SCALE_RANGE = [0.1, 10]

const Svg = (props) => {
  const { width, height, data, nodeRender } = props
  const refSvg = useRef()
  const refMain = useRef()

  useEffect(() => {
    const svg = select(refSvg.current)
    const g = select(refMain.current)
    if (width && height) {
      svg.call(
        zoom()
          .extent([
            [0, 0],
            [width, height]
          ])
          .scaleExtent(SCALE_RANGE)
          .on('zoom', ({ transform }) => {
            g.attr('transform', transform)
          })
      )
    }
  }, [width, height])

  const { nodes, links, translate, scale } = useMemo(() => {
    if (width && height && data) {
      const treeLayout = tree()
        .size([height, width]) // Swap height and width for vertical layout
        .nodeSize(NODE_SIZE)(data)

      const nodes = treeLayout.descendants()
      const links = treeLayout.links()

      // Swap x and y coordinates for vertical layout
      nodes.forEach((node) => {
        const x = node.x
        node.x = node.y
        node.y = x
      })

      const translate = [width / 2, NODE_SIZE[1] / 2] // Adjust translate
      const scale = height / ((data.height + 1) * NODE_SIZE[1]) // Adjust scale
      return { nodes, links, translate, scale }
    } else {
      return {
        nodes: [],
        links: [],
        translate: [0, 0],
        scale: 1
      }
    }
  }, [data, width, height])

  return (
    <svg ref={refSvg} style={{ width: width, height: height }}>
      <marker id='m1'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='5'
        markerHeight='5'>
        <circle cx='5' cy='5' r='5' />
      </marker>
      <g className='d3-tree-main' ref={refMain}>
        <g transform={`translate(${translate}) scale(${scale})`}>
          {nodes && <Links links={links} nodes={nodes} />}
          {links && <Nodes nodes={nodes} nodeRender={nodeRender} />}
        </g>
      </g>
    </svg>
  )
}
export default Svg