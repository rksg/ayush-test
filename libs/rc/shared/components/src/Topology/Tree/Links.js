import React from 'react'

const Links = (props) => {
  const { links, linksCoordinate } = props

  const linkCustom = ({ source, target }, radius) => {
    const linkCoor = linksCoordinate[`${source.data.id}_${target.data.id}`]
    const sourceX = linkCoor.source.x
    const sourceY = linkCoor.source.y
    const targetX = linkCoor.target.x
    const targetY = linkCoor.target.y
    const breakX = sourceX + 25
    if (sourceY === targetY) {
      return `M${sourceY} ${sourceX}  L${targetY} ${targetX - 100}`
    } else {
      const isClockwise = targetY < sourceY
      const path = `M${sourceY} ${sourceX} 
    L${sourceY} ${breakX - radius}
    a${radius},${radius} 0 0 ${isClockwise ? 1 : 0} ${isClockwise ? -radius : radius},${radius}
    L${isClockwise ? targetY + radius : targetY - radius} ${breakX} 
    a${radius},${radius} 0 0 ${isClockwise ? 0 : 1} ${isClockwise ? -radius : radius},${radius}
    L${targetY} ${targetX - 100} `
      return path
    }
  }

  return (
    <g className='d3-tree-links'>
      {links.map((link, i) => (
        <g key={i}
          transform={`translate(0, -${40 + (65 * link.source.depth) })`}>
          <path
          //eslint-disable-next-line max-len
            d={linkCustom(link, 5)}
            markerStart='url(#m1)'
            markerEnd='url(#m1)'
          />
        </g>
      ))}
    </g>
  )
}
export default Links