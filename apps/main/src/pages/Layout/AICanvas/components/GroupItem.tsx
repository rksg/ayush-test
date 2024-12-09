// @ts-nocheck
import { useEffect } from 'react'

import { useDrop } from 'react-dnd'

import utils from '../utils'

import Card from './Card'

export const ItemTypes = {
  CARD: 'card'
}

export default function GroupItem (props) {
  const defaultLayout = props.layout
  const { id, cards, index, groups, layout, handleLoad, moveCardInGroupItem } = props

  useEffect(() => {
    let clientWidth
    const containerDom = document.querySelector('#card-container')
    if (containerDom) {
      clientWidth = containerDom.clientWidth
    }
    if (layout.containerWidth !== clientWidth) {
      handleLoad()
    }
  }, [layout])

  const containerHeight = utils.getContainerMaxHeight(
    cards,
    layout.rowHeight,
    layout.margin
  )

  const dropCard = (dragItem, dropItem) => {
    if (dragItem.type === ItemTypes.CARD) {
      props.onCardDropInGroupItem(dragItem, dropItem)
      return dropItem
    }
  }

  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item) => {
      const dragItem = item
      const dropItem = props
      dropCard(dragItem, dropItem)
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    }),
    hover: (item, monitor) => {
      const dragItem = item
      if (dragItem.type === ItemTypes.CARD) {
        if(props.shadowCard.id !== dragItem.id){
          props.updateShadowCard(dragItem)
          return
        }
        //卡片到组
        const hoverItem = props
        const { x, y } = monitor.getClientOffset()
        const containerDom = document.getElementById('group' + hoverItem.id)
        const groupItemBoundingRect = containerDom.getBoundingClientRect()
        const groupItemX = groupItemBoundingRect.left
        const groupItemY = groupItemBoundingRect.top
        moveCardInGroupItem(
          hoverItem,
          x - groupItemX,
          y - groupItemY
        )
      }
    }
  })

  return (
    <div className='rglb_group-item' ref={dropRef} id={'group' + id}>
      <div
        className='group-item-container'
        // style={{
        //   background: isOver ? cssStr('--acx-accents-blue-30') : cssStr('--acx-accents-blue-10')
        // }}
      >
        <section
          id='card-container'
          style={{
            height:
                containerHeight > defaultLayout.containerHeight
                  ? containerHeight
                  : defaultLayout.containerHeight
          }}
        >
          {
            cards.map((c, i) => <Card
              key={`${index}_${c.id}`}
              groupIndex={index}
              card={c}
              group={props}
              groups={groups}
              layout={props.layout}
              dropCard={dropCard}
              updateShadowCard={props.updateShadowCard}
              updateGroupList={props.updateGroupList}
              deleteCard={props.deleteCard}
            />
            )
          }
        </section>
      </div>
    </div>
  )
}
