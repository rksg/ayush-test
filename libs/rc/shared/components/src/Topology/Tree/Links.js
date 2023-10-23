import React from 'react'

const linkCustom = ({ source, target }) => {
  const elbowX = source.y + (target.y - source.y) // Calculate the x-coordinate for the elbow
  // eslint-disable-next-line max-len
  return `M${source.y} ${source.x - 35} L${elbowX} ${source.x - 35} L${elbowX} ${target.x - 160} L${target.y} ${target.x - 150}`
}

const Links = (props) => {
  const { links } = props
  return (
    <g className='d3-tree-links'>
      {links.map((link, i) => (
        <g key={i} transform={`translate(0, ${link.source.depth * -65})`}>
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