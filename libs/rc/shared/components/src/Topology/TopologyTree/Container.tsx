import { useClientRect } from './hooks/useClientRect'
import Svg               from './Svg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Container = (props: any) => {
  const [rect, ref] = useClientRect()

  return (
    <div className='d3-tree-container' ref={ref}>
      {rect && <Svg width={rect.width} height={rect.height} {...props} />}
    </div>
  )
}

export default Container
