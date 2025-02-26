import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import _                              from 'lodash'
import { ConnectDragSource, useDrag } from 'react-dnd'
import { getEmptyImage }              from 'react-dnd-html5-backend'

import { DeleteOutlined, EditOutlined, Plus, Minus } from '@acx-ui/icons-new'
import { WidgetListData }                            from '@acx-ui/rc/utils'

import { CardInfo, Group, LayoutConfig } from '../Canvas'
import utils                             from '../utils'
import { compactLayoutHorizontal }       from '../utils/compact'

import { GroupProps, ItemTypes } from './GroupItem'
import { WidgetChart }           from './WidgetChart'

interface CardProps {
  groupIndex: number
  card: CardInfo
  group: GroupProps
  groups: Group[]
  layout: LayoutConfig
  dropCard: (dragItem: CardInfo, dropItem: GroupProps) => void
  updateShadowCard: Dispatch<SetStateAction<CardInfo>>
  updateGroupList: Dispatch<SetStateAction<Group[]>>
  deleteCard:(id: string, groupIndex: number) => void
  drag?: ConnectDragSource
}
const DraggableCard = (props: CardProps) => {
  const [, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      let dragCard = props.card
      dragCard.isShadow = true
      props.updateShadowCard(dragCard)
      return { id: dragCard.id, type: ItemTypes.CARD } as CardInfo
    },
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        props.dropCard(item, props.group)
      }
    }
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div>
      <Card
        {...props}
        drag={drag}
      />
    </div>
  )
}

export default DraggableCard

function Card (props: CardProps) {
  const {
    groupIndex,
    deleteCard,
    drag,
    card
  } = props
  const {
    id,
    gridx,
    gridy,
    width,
    height,
    isShadow
  } = props.card
  const { margin, rowHeight, calWidth } = props.layout
  const [visible, setVisible] = useState(false)
  const { x, y } = utils.calGridItemPosition(
    gridx,
    gridy,
    margin,
    rowHeight,
    calWidth
  )
  const { wPx, hPx } = utils.calWHtoPx(
    width,
    height,
    margin,
    rowHeight,
    calWidth
  )

  const changeCardsLayout = (nextSizeIndex: number) => {
    let groupsTmp = _.cloneDeep(props.groups)
    let cardTmp = _.cloneDeep(card)
    cardTmp = {
      ...cardTmp,
      currentSizeIndex: nextSizeIndex,
      width: cardTmp.sizes[nextSizeIndex].width,
      height: cardTmp.sizes[nextSizeIndex].height
    }
    groupsTmp[groupIndex].cards.some((item, index) => {
      if(item.id === cardTmp.id) {
        groupsTmp[groupIndex].cards[index] = cardTmp
        // eslint-disable-next-line max-len
        let compactedLayout = compactLayoutHorizontal(groupsTmp[groupIndex].cards, props.layout.col, null)
        groupsTmp[groupIndex].cards = compactedLayout
        return true
      }
      return false
    })
    props.updateGroupList(groupsTmp)
  }

  const increaseCard = () => {
    const nextSizeIndex = card.currentSizeIndex + 1
    if(nextSizeIndex >= card.sizes.length) {
      return
    }

    changeCardsLayout(nextSizeIndex)
  }

  const decreaseCard = () => {
    const nextSizeIndex = card.currentSizeIndex - 1
    if(nextSizeIndex < 0) {
      return
    }

    changeCardsLayout(nextSizeIndex)
  }

  return (
    <div>
      {
        isShadow ?
          <div
            className='card-shadow'
            style={{
              width: wPx,
              height: hPx,
              transform: `translate(${x}px, ${y}px)`
            }}
          ></div>
          :
          <div
            ref={drag}
            className='card'
            style={{
              width: wPx,
              height: hPx,
              opacity: 1,
              transform: `translate(${x}px, ${y}px)`
            }}
          >
            <div className='card-actions'>
              <div
                data-testid='increaseCard'
                className={`icon ${
                  card.currentSizeIndex+1 >= card.sizes?.length ? 'disabled' : ''}`}
                onClick={() => {
                  increaseCard()
                }}
              >
                <Plus />
              </div>
              <div
                data-testid='decreaseCard'
                className={`icon ${card.currentSizeIndex <= 0 ? 'disabled' : ''}`}
                onClick={() => {
                  decreaseCard()
                }}
              >
                <Minus />
              </div>
              <div
                data-testid='editCard'
                className='icon'
                onClick={() => {
                  setVisible(true)
                }}
              >
                <EditOutlined />
              </div>
              <div
                data-testid='deleteCard'
                className='icon'
                onClick={() => {
                  deleteCard(id, groupIndex)
                }}
              >
                <DeleteOutlined />
              </div>
            </div>
            {
              card.chartType &&
              <WidgetChart
                data={card as unknown as WidgetListData}
                visible={visible}
                setVisible={setVisible}
              />
            }
          </div>
      }
    </div>
  )
}
