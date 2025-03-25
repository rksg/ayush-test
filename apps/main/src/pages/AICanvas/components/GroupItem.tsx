import { Dispatch, SetStateAction, useEffect } from 'react'

import { useDrop, XYCoord } from 'react-dnd'

import { CardInfo, Group, LayoutConfig } from '../Canvas'
import utils                             from '../utils'

import Card from './Card'

export const ItemTypes = {
  CARD: 'card'
}

export interface GroupProps {
  key: string
  id: string
  type: string
  index: number
  cards: CardInfo[]
  length: number
  groups: Group[]
  layout: LayoutConfig
  defaultLayout: LayoutConfig
  shadowCard:CardInfo
  moveCardInGroupItem:(hoverItem: GroupProps, x: number, y: number) => void
  onCardDropInGroupItem:() => void
  updateShadowCard:Dispatch<SetStateAction<CardInfo>>
  updateGroupList:Dispatch<SetStateAction<Group[]>>
  handleLoad:() => void
  deleteCard:(id: string, groupIndex: number) => void
  removeShadowCard: (groupIndex: number)=>void
}

export default function GroupItem (props: GroupProps) {
  const defaultLayout = props.layout
  const { id, cards, index, groups, layout, shadowCard, handleLoad, moveCardInGroupItem } = props
  // const sectionRef = useRef(null)
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

  const dropCard = (dragItem: CardInfo, dropItem: GroupProps) => {
    if (dragItem.type === ItemTypes.CARD) {
      props.onCardDropInGroupItem()
      return dropItem
    }
    return
  }

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item: CardInfo) => {
      const dragItem = item
      const dropItem = props
      dropCard(dragItem, dropItem)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    }),
    hover: (item: CardInfo, monitor) => {
      const dragItem = item
      if (dragItem.type === ItemTypes.CARD) {
        if(shadowCard.id !== dragItem.id){
          props.updateShadowCard(dragItem)
          return
        }
        // Dragging card to group
        const hoverItem = props
        const cor = monitor.getClientOffset() as XYCoord
        const containerDom = document.getElementById('group' + hoverItem.id)
        const groupItemBoundingRect = containerDom?.getBoundingClientRect()
        const groupItemX = groupItemBoundingRect?.left
        const groupItemY = groupItemBoundingRect?.top
        moveCardInGroupItem(
          hoverItem,
          cor.x - (groupItemX || 0),
          cor.y - (groupItemY || 0)
        )
      }
    }
  })

  useEffect(() => {
    if (shadowCard.id && !isOver && canDrop) {
      props.removeShadowCard(index)
    }
  }, [shadowCard, isOver])

  return (
    <div className='rglb_group-item' ref={dropRef} id={'group' + id} data-testid='dropGroup'>
      <div className='group-item-container'>
        <section
          id='card-container'
          // ref={sectionRef}
          style={{
            height:
                containerHeight > defaultLayout.containerHeight
                  ? containerHeight
                  : defaultLayout.containerHeight
          }}
        >
          {
            cards.map((c) => <Card
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
              // sectionRef={sectionRef}
            />
            )
          }
        </section>
      </div>
    </div>
  )
}
