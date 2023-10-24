import React from 'react'

import { useClientRect } from './hooks/useClientRect'
import Svg               from './Svg'

const Container = (props) => {
  const [rect, ref] = useClientRect()

  return (
    <div className='d3-tree-container' ref={ref}>
      {rect && <Svg width={rect.width} height={rect.height} ref={props.ref} {...props} />}
    </div>
  )
}
export default Container