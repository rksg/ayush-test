/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo, useContext } from 'react'

import { HierarchyPointNode, drag, select, tree } from 'd3'
import _                                          from 'lodash'

import { NodeData, Link } from '@acx-ui/rc/utils'

import { TreeData }      from '..'
import { transformData } from '../utils'

import { Edge, Links }         from './Links'
import Nodes                   from './Nodes'
import { TopologyTreeContext } from './TopologyTreeContext'

const NODE_SIZE: [number, number] = [45, 150]

interface TopologyProps {
  ref: SVGSVGElement
  data: TreeData
  edges: Link[]
  onNodeHover: (node: NodeData, event: React.MouseEvent<Element, globalThis.MouseEvent> |
    React.MouseEvent<SVGGElement, globalThis.MouseEvent>) => void
  onNodeClick: () => void
  onLinkClick: (node: Edge, event: MouseEvent) => void
  onNodeMouseLeave: () => void
  onLinkMouseLeave: () => void
  closeTooltipHandler: () => void
  closeLinkTooltipHandler: () => void
  selectedVlanPortList: string[]
  width: number
  height: number
}

interface nodeCoordinateProps {
  [key: string]: { x: number, y: number }
}
interface linkCoordinateProps {
  [key: string]: any
}

const Svg = (props: TopologyProps) => {
  const { width, height, data, edges, onNodeHover,
    onNodeClick, onLinkClick, onNodeMouseLeave, onLinkMouseLeave,
    closeTooltipHandler, closeLinkTooltipHandler, selectedVlanPortList
  } = props
  const refSvg = useRef<any>(null)
  const refMain = useRef<SVGGElement>(null)
  const [treeData, setTreeData] = useState<d3.HierarchyNode<TreeData> | null>(null)
  const [nodesCoordinate, setNodesCoordinate] = useState<nodeCoordinateProps>({})
  const [linksInfo, setLinksInfo] = useState<linkCoordinateProps>({})
  const { scale, translate, setTranslate, setOnDrag } =
    useContext(TopologyTreeContext)

  const handleDrag = drag()
    .on('start', (event) => {
      setOnDrag(true)
      event.subject.startX = event.sourceEvent.layerX
      event.subject.startY = event.sourceEvent.layerY
    })
    .on('drag', (event) => {
      setOnDrag(true)
      const { startX, startY } = event.subject
      const dx = event.sourceEvent.layerX - startX
      const dy = event.sourceEvent.layerY - startY

      const treeContainer = document.querySelector('#treeContainer')
      const containerWidth = treeContainer?.clientWidth || 0
      const containerHeight = treeContainer?.clientHeight || 0

      let boundaryDx = translate[0] + dx >= containerWidth ?
        containerWidth : (translate[0] + dx <= 0 ?
          0 : translate[0] + dx)
      let boundaryDy = translate[1] + dy >= containerHeight ?
        containerHeight : (translate[1] + dy <= -200 ?
          -200 : translate[1] + dy)

      setTranslate([boundaryDx, boundaryDy])
      closeTooltipHandler()
      closeLinkTooltipHandler()
    })
    .on('end', () => {
      setOnDrag(false)
    })

  useEffect(() => {
    const svg = select(refSvg.current)

    if (width && height) {
      svg.call(handleDrag)
    }
    if (data) {
      setTreeData(transformData(data))
    }
  }, [width, height, data, translate])

  const { nodes, links } = useMemo(() => {
    if (treeData && edges) {
      const treeLayout = tree()
        .size([height, width]) // Swap height and width for vertical layout
        .nodeSize(NODE_SIZE)(treeData as any)

      const nodes = treeLayout.descendants()
      const links = treeLayout.links()

      // Update linkPositions state
      let linkPositionData: linkCoordinateProps = {}
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

      const nodePositionData: nodeCoordinateProps = {}
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
              links={links as unknown as Edge[]}
              linksInfo={linksInfo}
              onClick={onLinkClick}
              onMouseLeave={onLinkMouseLeave}
              selectedVlanPortList={selectedVlanPortList}
            />
          }
          {links && (
            <Nodes
              nodes={nodes as HierarchyPointNode<NodeData>[]}
              expColEvent={expColEvent}
              onHover={onNodeHover}
              onClick={onNodeClick}
              onMouseLeave={onNodeMouseLeave}
              nodesCoordinate={nodesCoordinate}
              selectedVlanPortList={selectedVlanPortList}
            />
          )}
        </g>
      </g>
    </svg>
  )
}

export default Svg