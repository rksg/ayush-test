import React, { useState, useRef, useEffect, useCallback } from 'react'

import _             from 'lodash'
import { Resizable } from 'react-resizable'

import { ResizableHover, ResizableHandle } from './styledComponents'

interface ResizableColumnProps extends React.PropsWithChildren {
  width?: number
  onResize: (width: number) => void
}


export const ResizableColumn: React.FC<ResizableColumnProps> = (props) => {
  const { onResize, width: columnWidth, ...rest } = props
  const [width, setWidth] = useState(columnWidth)
  const [currentHeaderCell, setCurrentHeaderCell] = useState<HTMLTableHeaderCellElement>()
  const headerCellRef = useRef<HTMLTableHeaderCellElement>(null)

  const handleResizeStop = useCallback(() => setCurrentHeaderCell(undefined), [])
  const handleStopPropagation = useCallback((e: Event) => e.stopPropagation(), [])

  useEffect(() => {
    if (headerCellRef && headerCellRef.current !== currentHeaderCell) {
      if (onResize) onResize(headerCellRef.current?.offsetWidth as number)
      setWidth(headerCellRef.current?.offsetWidth as number)
    }
  }, [headerCellRef, headerCellRef?.current?.offsetWidth, currentHeaderCell])

  if (_.isNil(width)) return <th ref={headerCellRef} {...rest} />

  rest.children = <><ResizableHover />{rest.children}</>
  return <Resizable
    width={width}
    height={0}
    handle={<ResizableHandle />}
    onResizeStop={() => {
      document.removeEventListener('mouseup', handleResizeStop)
      headerCellRef.current!.addEventListener('click', handleStopPropagation)
    }}
    onResizeStart={() => {
      setCurrentHeaderCell(headerCellRef.current!)
      document.addEventListener('mouseup', handleResizeStop, { once: true })
      headerCellRef.current!.addEventListener('click', handleStopPropagation, { once: true })
    }}
    onResize={(_: React.SyntheticEvent<Element>, { size }) => {
      onResize(size.width)
      setWidth(size.width)
    }}
    draggableOpts={{ enableUserSelectHack: false }}
    children={<th ref={headerCellRef} {...rest} />}
  />
}
