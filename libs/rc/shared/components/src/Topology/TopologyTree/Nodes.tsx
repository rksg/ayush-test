import React, { useState, useEffect, MouseEvent } from 'react'

import { MinusCircleOutlined, PlusCircleOutlined, R1Cloud } from '@acx-ui/icons'
import { Node }                                             from '@acx-ui/rc/utils'

import { getDeviceIcon, getDeviceColor, truncateLabel } from '../utils'

interface NodeData extends Node {
  children?: NodeData[]
  _children?: NodeData[]
}

interface NodeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any;
  expColEvent: (nodeId: string) => void;
  onHover: (node: NodeData, event: MouseEvent) => void;
  onClick: (node: NodeData, event: MouseEvent) => void;
  nodesCoordinate: { [id: string]: { x: number; y: number } };
}

const Nodes: React.FC<NodeProps> = (props) => {
  const [color, setColor] = useState<{ [id: string]: string }>({})
  let delayHandler: NodeJS.Timeout
  const { nodes, expColEvent, onHover, onClick, nodesCoordinate } = props

  useEffect(() => {
    nodes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((node: any) => node.ancestors().length === 2)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .forEach((node: any) => {
        const r = Math.floor(Math.random() * 255)
        const g = Math.floor(Math.random() * 255)
        const b = Math.floor(Math.random() * 255)
        setColor((prevState) => ({
          ...prevState,
          [node.data.id]: `rgb(${r}, ${g}, ${b})`
        }))
      })
  }, [nodes])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function coordinateTransform (node: any) {
    return `translate(${nodesCoordinate[node.data.id].y},
      ${nodesCoordinate[node.data.id].x - 65 * node.ancestors().length})`
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseEnter = (node: any , event: any) => {
    if(node.data.id === 'Cloud'){
      return
    }
    delayHandler = setTimeout(() => {
      onHover(node, event)
    }, 1000)
  }

  const handleMouseLeave = () => {
    clearTimeout(delayHandler)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (node: any , event: any) => {
    onClick(node, event)
    clearTimeout(delayHandler)
  }

  return (
    <g className='output d3-tree-nodes'>
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes.map((node: any) => {
          const ancestorName = node.parent
            ? node
              .ancestors()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((ancestor: any) => ancestor.ancestors().length === 2)[0].data
              .id
            : ''
          const children = node.data.children?.length > 0 ? `(${node.data.children.length})` :
            (node.data._children?.length > 0 ? `(${node.data._children.length})` : '')
          return (
            <g
              key={node.data.id}
              transform={coordinateTransform(node)}
              style={{
                fill: color[ancestorName],
                cursor: node.data.id !== 'Cloud' ? 'pointer' : 'default'
              }}
              id={node.data.id}
              className={'node tree-node'}
              data-testid={`node_${node.data.id}`}
            >
              <g
                onMouseEnter={(e) => handleMouseEnter(node, e)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleClick(node, e)}
              >
                <circle cx='0' cy='0' r='15' className={`${node.data.status}-circle`} />
                <g className={`${node.data.status}-icon`}>
                  {node.parent ? (
                    getDeviceIcon(node.data.type, node.data.status)
                  ) : (
                    <R1Cloud width={24} height={24} x={-12} y={-12} />
                  )}
                </g>
                <g>
                  <text
                    className='node-text'
                    style={{
                      fontSize: '6px',
                      stroke: node.data.status ? getDeviceColor(node.data.status) : 'black',
                      fill: node.data.status ? getDeviceColor(node.data.status) : 'black'
                    }}
                    dominant-baseline='middle'
                    text-anchor='middle'
                    dy='13'
                  >
                    {children !== '' && node.data.id !== 'Cloud' ?
                      node.data.name.substring(0,8)+children+'...'
                      :truncateLabel(node.data.name, 13)}
                  </text>
                </g>
              </g>
              {node.data.id !== 'Cloud' && node.data.children?.length > 0 && (
                <g onClick={(e) => {
                  e.preventDefault()
                  expColEvent(node.data.id)
                }}
                >
                  <MinusCircleOutlined
                    width={10}
                    height={10}
                    x={-5}
                    y={22}
                    style={{ fill: 'white' }}
                  />
                </g>
              )}
              {node.data._children?.length > 0 && (
                <g onClick={(e) => {
                  e.preventDefault()
                  expColEvent(node.data.id)
                }}>
                  <PlusCircleOutlined
                    width={10}
                    height={10}
                    x={-5}
                    y={22}
                    id={node.data.id}
                    style={{ fill: 'white' }}
                  />
                </g>
              )}
            </g>
          )
        })}
    </g>
  )
}

export default Nodes