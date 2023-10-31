import React, { useState, useEffect } from 'react'

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
            onContextMenu={(e) => {
              e.preventDefault()
              expColEvent(node.data.DisplayName)
            }}
            onClick={(e) => {
              onClick(node, e)
            }}
            id={node.data.DisplayName}
            className={'tree-node'}
          >
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
                dy='20'
                dx={-node.data.DisplayName.length - (node.data.DisplayName.length/2)}
              >
                {node.data.DisplayName}
              </text>
            </g>
          </g>
        )
      })}
    </g>
  )
}
export default Nodes