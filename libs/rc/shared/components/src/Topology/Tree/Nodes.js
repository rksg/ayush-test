import React, { useState, useEffect } from 'react'

import { TopologyCollapse, TopologyExpand } from '@acx-ui/icons'

const Nodes = (props) => {
  const [color, setColor] = useState({})
  const { nodes, nodeRender, expColEvent, onClick, nodesCoordinate } = props

  useEffect(() => {
    nodes
      .filter((node) => node.ancestors().length === 2)
      .forEach((node) => {
        const r = Math.floor(Math.random() * 255)
        const g = Math.floor(Math.random() * 255)
        const b = Math.floor(Math.random() * 255)
        setColor((prevState) => ({
          ...prevState,
          [node.data.DisplayName]: `rgb(${r}, ${g}, ${b})`
        }))
      })
  }, [nodes])

  function coordinateTransform (node){
    return `translate(${nodesCoordinate[node.data.id].y},
      ${nodesCoordinate[node.data.id].x - (65 * node.ancestors().length )})`
  }

  return (
    <g className='d3-tree-nodes'>
      {nodes.map((node, i) => {
        const ancestorName = node.parent
          ? node
            .ancestors()
            .filter((ancestor) => ancestor.ancestors().length === 2)[0].data
            .DisplayName
          : ''
        return (
          <g
            key={node.data.DisplayName}
            transform={coordinateTransform(node)}
            style={{
              fill: color[ancestorName],
              cursor: node.data.DisplayName !=='Cloud' ? 'pointer' : 'default'
            }}
            id={node.data.DisplayName}
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
                  dx={-node.data.DisplayName.length - (node.data.DisplayName.length/2)}
                  dy='18'
                >
                  {node.data.DisplayName}
                </text>
              </g>
            </g>
            {node.data.DisplayName !=='Cloud' && node.data.children?.length > 0 &&
              <g onClick={(e) => {
                e.preventDefault()
                expColEvent(node.data.DisplayName)
              }}>
                <TopologyExpand
                  width={10}
                  height={10}
                  x={-node.data.DisplayName.length/2 + 1}
                  y='22'
                />
              </g>
            }
            {node.data._children?.length > 0 &&
              <g onClick={(e) => {
                e.preventDefault()
                expColEvent(node.data.DisplayName)
              }}>
                <TopologyCollapse
                  width={10}
                  height={10}
                  x={-node.data.DisplayName.length/2 + 1}
                  y='22'
                  id={node.data.DisplayName}
                />
              </g>
            }
          </g>
        )
      })}
    </g>
  )
}
export default Nodes