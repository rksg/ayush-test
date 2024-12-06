// @ts-nocheck
import React, { useEffect } from 'react'

import _                    from 'lodash'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage }    from 'react-dnd-html5-backend'

import utils                       from '../utils'
import { compactLayoutHorizontal } from '../utils/compact'
import { WidgetChart }             from '../WidgetChart'

import { ItemTypes } from './GroupItem'

const DraggableCard = (props) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      let dragCard = props.card
      dragCard.isShadow = true
      console.log(dragCard)
      props.updateShadowCard(dragCard)
      return { id: dragCard.id, type: ItemTypes.CARD }
    },
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        props.dropCard(item, props.group)
      }
    }
  })
  const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }))

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div>
      <Card
        {...props}
        isDragging={isDragging}
        drop={drop}
        drag={drag}
      />
    </div>
  )
}

export default DraggableCard

function Card (props) {
  const {
    groupIndex,
    deleteCard,
    drop,
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

  const changeCardsLayout = (nextSizeIndex) => {
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
        let compactedLayout = compactLayoutHorizontal(groupsTmp[groupIndex].cards, props.layout.col)
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
            // ref={(node) => drag(drop(node))}
            ref={drag}
            className='card'
            style={{
              width: wPx,
              height: hPx,
              opacity: 1,
              transform: `translate(${x}px, ${y}px)`
            }}
          >
            <div
              className='card-actions'
              style={{
                position: 'absolute',
                top: 0,
                right: '25px',
                zIndex: 1
              }}
            >
              <b>{id}</b>
              <button
                style={{ height: '30px', margin: '10px' }}
                onClick={() => {
                  deleteCard(id, groupIndex)
                }}
              >
                Delete
              </button>
              {
                card.sizes && <button
                  style={{ height: '30px', width: '30px', margin: '10px' }}
                  disabled={card.currentSizeIndex+1 >= card.sizes?.length}
                  onClick={() => {
                    increaseCard()
                  }}
                >
                  +
                </button>
              }
              {
                card.sizes && <button
                  style={{ height: '30px', width: '30px', margin: '10px' }}
                  disabled={card.currentSizeIndex <= 0}
                  onClick={() => {
                    decreaseCard(props)
                  }}
                >
                  -
                </button>
              }
            </div>
            {
              card.chartType &&
              <WidgetChart data={card} />
            }
          </div>
      }
    </div>
  )
}
