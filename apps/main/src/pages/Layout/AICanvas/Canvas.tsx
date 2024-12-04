// @ts-nocheck
import React, { useEffect, useState } from 'react'

import { useDrop } from 'react-dnd'

import { cssStr } from '@acx-ui/components'

import * as UI     from './styledComponents'
import utils       from './utils'
import WidgetChart from './WidgetChart'

export const ItemTypes = {
  WIDGET: 'widget'
}

export default function Canvas (props) {
  const [widgets, setWidgets] = useState([])
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.WIDGET,
    drop: (item) => {
      const dragItem = item
      const dropItem = props
      console.log('dragItem: ', dragItem)
      console.log('dropItem: ', dropItem)
      // dropCard(dragItem, dropItem)
      setWidgets([...widgets, dragItem])
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    }),
    hover: (item, monitor) => {
      const dragItem = item
      console.log(item)
      if (dragItem.type === ItemTypes.WIDGET) {
        //卡片到组
        const hoverItem = props
        const { x, y } = monitor.getClientOffset()
        const containerDom = document.getElementById('grid')
        const groupItemBoundingRect = containerDom.getBoundingClientRect()
        const groupItemX = groupItemBoundingRect.left
        const groupItemY = groupItemBoundingRect.top
        console.log(hoverItem, ' x,y: ', groupItemX, ' ', groupItemY)
        // moveCardInGroupItem(
        //   hoverItem,
        //   x - groupItemX,
        //   y - groupItemY
        // )
      }
    }
  })

  return (
    <UI.Canvas>
      <div className='header'>
        <div className='title'>
          <span>Canvas</span>
        </div>
        {/* <div className='actions'>
          <Button role='primary' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Publish' })}
          </Button>
          <Button role='primary' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button className='black' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
        </div> */}
      </div>
      <div className='grid' id='grid' ref={dropRef}>
        {
          widgets.map((widget, index) => <WidgetChart key={index} data={widget} />)
        }
      </div>
    </UI.Canvas>
  )
}
