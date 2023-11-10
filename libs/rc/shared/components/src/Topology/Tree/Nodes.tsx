import React, { useState, useEffect, MouseEvent } from 'react'

import { MinusCircleOutlined, PlusCircleOutlined } from '@acx-ui/icons'
import { Node }                                    from '@acx-ui/rc/utils'

interface NodeData extends Node {
  children?: NodeData[]
  _children?: NodeData[]
}

interface NodeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any;
  nodeRender: (node: NodeData, i: number) => JSX.Element;
  expColEvent: (nodeId: string) => void;
  onClick: (node: NodeData, event: MouseEvent) => void;
  nodesCoordinate: { [id: string]: { x: number; y: number } };
}

const Nodes: React.FC<NodeProps> = (props) => {
  const [color, setColor] = useState<{ [id: string]: string }>({})
  const { nodes, nodeRender, expColEvent, onClick, nodesCoordinate } = props

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

  return (
    <g className='d3-tree-nodes'>
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes.map((node: any, i: number) => {
          const ancestorName = node.parent
            ? node
              .ancestors()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((ancestor: any) => ancestor.ancestors().length === 2)[0].data
              .id
            : ''

          return (
            <g
              key={node.data.id}
              transform={coordinateTransform(node)}
              style={{
                fill: color[ancestorName],
                cursor: node.data.id !== 'Cloud' ? 'pointer' : 'default'
              }}
              id={node.data.id}
              className={'tree-node'}
            >
              <g onClick={(e) => {
                onClick(node, e)
              }}>
                <g>{nodeRender(node, i)}</g>
                <g>
                  <text
                    className='text-call-name'
                    style={{
                      fontSize: '6px',
                      fill: 'black',
                      stroke: 'black',
                      strokeWidth: 0.25
                    }}
                    dx={-node.data.name.length - node.data.name.length / 2}
                    dy='18'
                  >
                    {node.data.name}
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