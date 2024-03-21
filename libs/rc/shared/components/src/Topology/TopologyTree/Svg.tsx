/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo, useContext } from 'react'

import { drag, select, tree } from 'd3'
import _                      from 'lodash'

import { transformData } from '../utils'

import { Links }               from './Links'
import Nodes                   from './Nodes'
import { TopologyTreeContext } from './TopologyTreeContext'

const NODE_SIZE: [number, number] = [45, 150]

const Svg: any = (props: any) => {
  const { width, height, data, edges, onNodeHover, onNodeClick, onLinkClick } = props
  const refSvg = useRef<any>(null)
  const refMain = useRef<any>(null)
  const [treeData, setTreeData] = useState<any>(null) // Replace 'any' with the actual data type
  const [nodesCoordinate, setNodesCoordinate] = useState<any>({})
  const [linksInfo, setLinksInfo] = useState<any>({})
  const { scale, translate, setTranslate, setOnDrag } =
    useContext(TopologyTreeContext)

  useEffect(() => {
    const svg = select(refSvg.current)

    if (width && height) {
      svg.call(
        drag()
          .on('start', (event) => {
            setOnDrag(true)
            event.subject.startX = event.x
            event.subject.startY = event.y
          })
          .on('drag', (event) => {
            setOnDrag(true)
            const { startX, startY } = event.subject
            const dx = event.x - startX
            const dy = event.y - startY
            setTranslate([translate[0] + dx, translate[1] + dy])
          })
          .on('end', () => {
            setOnDrag(false)
          })
      )
    }
    if (data) {
      setTreeData(transformData(data))
    }
  }, [width, height, data])

  const { nodes, links } = useMemo(() => {
    if (treeData && edges) {
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
            (item.from === _.get(link, 'source.data.id') &&
            item.to === _.get(link, 'target.data.id')) ||
            (item.from === _.get(link, 'target.data.id') &&
            item.to === _.get(link, 'source.data.id')))[0]
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
      return { nodes, links }
    } else {
      return {
        nodes: [],
        links: []
      }
    }
  }, [treeData, edges])

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
    <svg ref={refSvg} style={{ width, height }} data-testid='topologyGraph'>
      <g className='d3-tree-main' ref={refMain}>
        <g transform={`translate(${translate}) scale(${scale})`}>
          {nodes &&
            <Links
              links={links as any}
              linksInfo={linksInfo}
              onClick={onLinkClick}
            />
          }
          {links && (
            <Nodes
              nodes={nodes}
              expColEvent={expColEvent}
              onHover={onNodeHover}
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