import { forwardRef } from 'react'

import { useClientRect } from './hooks/useClientRect'
import Svg               from './Svg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const Container = forwardRef((props: any, ref: any) => {
  const [rect, localRef] = useClientRect()

  return (
    <div className='d3-tree-container' ref={localRef}>
      {rect && <Svg width={rect.width} height={rect.height} {...props} />}
    </div>
  )
})

export default Container
