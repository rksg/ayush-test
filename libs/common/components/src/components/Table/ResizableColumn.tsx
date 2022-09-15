import React, { useState, useRef, useEffect } from 'react'

import _                                 from 'lodash'
import { Resizable, ResizeCallbackData } from 'react-resizable'

import { ResizableHover, ResizableHandle } from './styledComponents'

interface ResizableColumnProps extends React.PropsWithChildren {
  width?: number
  onResize: (width: number) => void
}

export const ResizableColumn: React.FC<ResizableColumnProps> = (props) => {
  const { onResize, width: columnWidth, ...rest } = props
  const [width, setWidth] = useState(columnWidth)
  const refContainer = useRef<HTMLTableHeaderCellElement>(null)
  useEffect(()=>{
    if(refContainer){
      setWidth(refContainer.current?.offsetWidth as number)
    }
  }, [refContainer])
  if(_.isNil(width)) {
    return <th ref={refContainer} {...rest} />
  }
  rest.children = <><ResizableHover />{rest.children}</>
  return <Resizable
    width={width}
    height={0}
    handle={<ResizableHandle onClick={e => { e.stopPropagation() }} />}
    onResize={(_: React.SyntheticEvent<Element>, callbackData: ResizeCallbackData)=>{
      onResize(callbackData.size.width)
      setWidth(callbackData.size.width)
    }}
    draggableOpts={{ enableUserSelectHack: false }}
    children={<th ref={refContainer} {...rest} />}
  />
}
