import React, { useState, useRef, useCallback } from 'react'

import _             from 'lodash'
import { Resizable } from 'react-resizable'

import { ResizableHover, ResizableHandle }    from './styledComponents'
import { defaultColumnWidth, minColumnWidth } from './useColumnsState'

interface ResizableColumnProps extends React.PropsWithChildren {
  onResize: (width: number) => void
  width?: number
  definedWidth?: number
}

export const ResizableColumn: React.FC<ResizableColumnProps> = (props) => {
  const { onResize, width: columnWidth, definedWidth, ...rest } = props
  const [width, setWidth] = useState(columnWidth)
  const headerCellRef = useRef<HTMLTableHeaderCellElement>(null)

  const handleStopPropagation = useCallback((e: Event) => e.stopPropagation(), [])

  if (_.isNil(width)) return <th ref={headerCellRef} {...rest} />

  rest.children = <><ResizableHover />{rest.children}</>
  return <Resizable
    width={width}
    height={0}
    minConstraints={[Math.min(definedWidth || defaultColumnWidth, minColumnWidth), 0]}
    handle={<ResizableHandle />}
    onResizeStart={() => {
      headerCellRef.current!.addEventListener('click', handleStopPropagation, { once: true })
    }}
    onResize={(_: React.SyntheticEvent<Element>, { size }) => {
      if (onResize) onResize(size.width)
      setWidth(size.width)
    }}
    draggableOpts={{ enableUserSelectHack: false }}
    children={<th ref={headerCellRef} {...rest} />}
  />
}
