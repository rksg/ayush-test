import React from 'react'

const linkCustom = ({ source, target }, radius) => {
  const elbowX = source.y + (target.y - source.y) // Calculate the x-coordinate for the elbow
  if (source.y === target.y) {
    // eslint-disable-next-line max-len
    return `M${source.y} ${source.x - 35} L${elbowX} ${source.x - 25} L${elbowX} ${target.x - 180} L${target.y} ${target.x - 150}`
  } else{
    const isClockwise = source.y < target.y
    const path = `M${source.y} ${source.x - 35}
    a${radius},${radius} 0 0 ${isClockwise ? 0 : 1} ${isClockwise ? radius : -radius},${radius}
    L${isClockwise ? elbowX - radius : elbowX + radius} ${source.x - (radius * 4)} 
    a${radius},${radius} 0 0 ${isClockwise ? 1 : 0} ${isClockwise ? radius : -radius},${radius}
    L${elbowX} ${target.x - 150}`
    return path
  }
}

const Links = (props) => {
  const { links } = props
  return (
    <g className='d3-tree-links'>
      {links.map((link, i) => (
        <g key={i} transform={`translate(0, ${link.source.depth * -65})`}>
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