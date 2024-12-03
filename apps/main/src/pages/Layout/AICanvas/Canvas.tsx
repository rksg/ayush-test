// @ts-nocheck
import React, { useEffect } from 'react'

import { useDrop } from 'react-dnd'

import { cssStr } from '@acx-ui/components'

import utils from '../utils'

import * as UI     from './styledComponents'

export const ItemTypes = {
  CARD: 'card'
}

export default function Canvas () {
  // const defaultLayout = props.layout
  // const { cards, index, groups, layout, handleLoad, moveCardInGroupItem } = props

  // useEffect(() => {
  //   let clientWidth
  //   const containerDom = document.querySelector('#card-container')
  //   if (containerDom) {
  //     clientWidth = containerDom.clientWidth
  //   }
  //   if (layout.containerWidth !== clientWidth) {
  //     handleLoad()
  //   }
  // }, [layout])

  // const containerHeight = utils.getContainerMaxHeight(
  //   cards,
  //   layout.rowHeight,
  //   layout.margin
  // )

  // const dropCard = (dragItem, dropItem) => {
  //   if (dragItem.type === 'card') {
  //     props.onCardDropInGroupItem(dragItem, dropItem)
  //     return dropItem
  //   }
  // }

  // const [{ isOver }, dropRef] = useDrop({
  //   accept: ItemTypes.CARD,
  //   drop: (item) => {
  //     const dragItem = item
  //     const dropItem = props
  //     dropCard(dragItem, dropItem)
  //   },
  //   collect: monitor => ({
  //     isOver: monitor.isOver()
  //   }),
  //   hover: (item, monitor) => {
  //     const dragItem = item
  //     if (dragItem.type === 'card') {
  //       //卡片到组
  //       const hoverItem = props
  //       const { x, y } = monitor.getClientOffset()
  //       const containerDom = document.getElementById('group' + hoverItem.id)
  //       const groupItemBoundingRect = containerDom.getBoundingClientRect()
  //       const groupItemX = groupItemBoundingRect.left
  //       const groupItemY = groupItemBoundingRect.top
  //       moveCardInGroupItem(
  //         hoverItem,
  //         x - groupItemX,
  //         y - groupItemY
  //       )
  //     }
  //   }
  // })

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
      <div className='grid'>

      </div>
    </UI.Canvas>
  )
}
