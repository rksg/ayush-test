import React from 'react'

const linkCustom = ({ source, target }, radius) => {
  const breakY = source.y + 25
  if (source.x === target.x) {
    return `M${source.y + 15} ${source.x} L${target.y - 16} ${target.x}`
  } else {
    const isClockwise = target.x < source.x
    return `M${source.y + 15} ${source.x} L${breakY - radius} ${
      source.x
    } a${radius},${radius} 0 0 ${isClockwise ? 0 : 1} ${radius},${
      isClockwise ? -radius : radius
    } L${breakY} ${
      isClockwise ? target.x + radius : target.x - radius
    } a${radius},${radius} 0 0 ${isClockwise ? 1 : 0} ${radius},${
      isClockwise ? -radius : radius
    } L${target.y - 16} ${target.x}`
  }
}

const Links = (props) => {
  const { links } = props
  return (
    <g className='d3-tree-links'>
      {links.map((link, i) => (
        <g key={i}>
          <path
          //eslint-disable-next-line max-len
            d={linkCustom(link, 12)}
            markerStart='url(#m1)'
            markerEnd='url(#m1)'
          />
        </g>
      ))}
    </g>
  )
}
export default Links