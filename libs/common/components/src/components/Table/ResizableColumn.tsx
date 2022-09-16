import React, { useState, useRef, useEffect } from 'react'

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
    onResizeStart={() => {
      setCurrentHeaderCell(headerCellRef.current!)
      document.addEventListener('mouseup', () => setCurrentHeaderCell(undefined), { once: true })
      headerCellRef.current!.addEventListener('click', e => e.stopPropagation(), { once: true })
    }}
    onResize={(_: React.SyntheticEvent<Element>, { size }) => {
      onResize(size.width)
      setWidth(size.width)
    }}
    draggableOpts={{ enableUserSelectHack: false }}
    children={<th ref={headerCellRef} {...rest} />}
  />
}
