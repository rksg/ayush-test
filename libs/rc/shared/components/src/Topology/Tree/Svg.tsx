/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react'

import { select, tree, zoom } from 'd3'
import _                      from 'lodash'

import { transformData } from '../utils'

import { Links } from './Links'
import Nodes     from './Nodes'

const NODE_SIZE: [number, number] = [45, 150]
const SCALE_RANGE: [number, number] = [0.1, 5]

const Svg: any = (props: any) => {
  const { width, height, data, edges, nodeRender, onNodeClick } = props
  const refSvg = useRef<any>(null)
  const refMain = useRef<any>(null)
  const [treeData, setTreeData] = useState<any>(transformData(data)) // Replace 'any' with the actual data type
  const [nodesCoordinate, setNodesCoordinate] = useState<any>({})
  const [linksInfo, setLinksInfo] = useState<any>({})

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
    if (width && height && treeData && edges) {
      const treeLayout = tree()
        .size([height, width]) // Swap height and width for vertical layout
        .nodeSize(NODE_SIZE)(treeData)

      const nodes = treeLayout.descendants()
      const links = treeLayout.links()

      // Update linkPositions state
      let linkPositionData: any = {}
      links.forEach((link) => {
        linkPositionData[`${_.get(link, 'source.data.id')}_${_.get(link, 'target.data.id')}`] =
        { ...link,
          ...edges.filter((item: { from: string; to: string }) =>
            item.from === _.get(link, 'source.data.id') &&
            item.to === _.get(link, 'target.data.id'))[0]
        }
      })
      if (!Object.keys(linksInfo).length) {
        setLinksInfo(linkPositionData)
      }

      const nodePositionData: any = {}
      // Swap x and y coordinates for vertical layout
      nodes.forEach((node) => {
        const x = node.x
        node.x = node.y
        node.y = x
        nodePositionData[_.get(node, 'data.id')] = { x: node.x, y: node.y }
      })
      if (!Object.keys(nodesCoordinate).length) {
        setNodesCoordinate(nodePositionData)
      }

      const translate = [width / 2, NODE_SIZE[1] / 2] // Adjust translate
      const scale = height / ((treeData.height + 1) * NODE_SIZE[1]) // Adjust scale

      return { nodes, links, translate, scale }
    } else {
      return {
        nodes: [],
        links: [],
        translate: [0, 0],
        scale: 1
      }
    }
  }, [treeData, edges, width, height])

  // expand/collapse children event
  const expColEvent = (nodeId: string) => {
    function removeChildren (data: any, targetNode: string): any {
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (targetNode === 'Cloud') {
            return data
          }
          if (data[i].id === targetNode) {
            if (data[i].children) {
              data[i]._children = data[i].children
              delete data[i].children
            } else {
              data[i].children = data[i]._children
              delete data[i]._children
            }
          } else {
            removeChildren(data[i].children, targetNode)
          }
        }
      }
      return data
    }

    const transformedData = removeChildren(data.data, nodeId)
    setTreeData(transformData({ data: transformedData }))
  }

  return (
    <svg ref={refSvg} style={{ width, height }}>
      <g className='d3-tree-main' ref={refMain}>
        <g transform={`translate(${translate}) scale(${scale})`}>
          {nodes && <Links links={links as any} linksInfo={linksInfo} />}
          {links && (
            <Nodes
              nodes={nodes}
              nodeRender={nodeRender}
              expColEvent={expColEvent}
              onClick={onNodeClick}
              nodesCoordinate={nodesCoordinate}
            />
          )}
        </g>
      </g>
    </svg>
  )
}

export default Svg