import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import { Slider }                     from 'antd'
import _                              from 'lodash'
import { ConnectDragSource, useDrag } from 'react-dnd'
import { getEmptyImage }              from 'react-dnd-html5-backend'
import { useIntl }                    from 'react-intl'

import { DeleteOutlined, EditOutlined } from '@acx-ui/icons-new'
import { WidgetListData }               from '@acx-ui/rc/utils'

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
  draggable?: boolean
  sliderWrapperRef?: React.MutableRefObject<null>
  // sectionRef?: React.MutableRefObject<null>
}

export interface WidgetProperty {
  name: string
  timeRange?: string
}

const DraggableCard = (props: CardProps) => {
  const sliderWrapperRef = useRef(null)
  const [, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    canDrag: (monitor) => {
      if(!props.draggable) {
        return false
      }
      const sliderElement = sliderWrapperRef.current
      if (!sliderElement) return true

      // @ts-ignore
      const rect = sliderElement.getBoundingClientRect()
      const isOverSlider =
        monitor.getClientOffset() &&
        // @ts-ignore
        monitor.getClientOffset().x >= rect.left &&
        // @ts-ignore
        monitor.getClientOffset().x <= rect.right &&
        // @ts-ignore
        monitor.getClientOffset().y >= rect.top &&
        // @ts-ignore
        monitor.getClientOffset().y <= rect.bottom

      return !isOverSlider
    },
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
    <div style={{ cursor: props.draggable ? 'grab' : 'default' }}>
      <Card
        {...props}
        drag={drag}
        sliderWrapperRef={sliderWrapperRef}
      />
    </div>
  )
}

export default DraggableCard

function Card (props: CardProps) {
  const { $t } = useIntl()
  const {
    groupIndex,
    deleteCard,
    drag,
    card,
    sliderWrapperRef
    // ,sectionRef
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

  const readOnly = !props.draggable
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

  const sliderMax = card.chartType === 'pie' ? 3 : 2

  const sliderMarks = useMemo(() => {
    const result: { [key: number]: string } = {}
    for (let i = 0; i <= sliderMax; i++) {
      result[i] = `${i + 1}x`
    }
    return result
  }, [sliderMax])

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

  const changeWidgetProperty = (widget: WidgetProperty) => {
    let groupsTmp = _.cloneDeep(props.groups)
    let cardTmp = _.cloneDeep(card)
    cardTmp = {
      ...cardTmp,
      name: widget.name,
      timeRange: widget.timeRange
    }
    groupsTmp[groupIndex].cards.some((item, index) => {
      if(item.id === cardTmp.id) {
        groupsTmp[groupIndex].cards[index] = cardTmp
        return true
      }
      return false
    })
    props.updateGroupList(groupsTmp)
  }

  const widgetRef = useRef(null)
  // const [resizing, setResizing] = useState(false)
  // const handler = (mouseDownEvent, card) => {
  //   mouseDownEvent.preventDefault() // prevent drag event
  //   const startSize = { x: x + wPx, y: y + hPx }
  //   const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY }
  //   const ranges = card.sizes.map(s => {
  //     const { wPx, hPx } = utils.calWHtoPx(
  //       s.width,
  //       s.height,
  //       margin,
  //       rowHeight,
  //       calWidth
  //     )
  //     return ({ x: x + wPx, y: y + hPx })
  //   })

  //   function onMouseMove (mouseMoveEvent) {
  //     const x = startSize.x - startPosition.x + mouseMoveEvent.pageX
  //     const y = startSize.y - startPosition.y + mouseMoveEvent.pageY
  //     ranges.some((r, index) => {
  //       if(index === ranges.length-1) {
  //         changeCardsLayout(index)
  //         return true
  //       }
  //       if (x <= r.x && y <= r.y) {
  //         changeCardsLayout(index)
  //         return true
  //       }

  //       if((x > r.x || y > r.y) && (x < ranges[index + 1].x || y < ranges[index + 1].y)) {
  //         changeCardsLayout(index+1)
  //         return true
  //       }
  //       return false
  //     })
  //   }
  //   function onMouseUp () {
  //     setResizing(false)
  //     widgetRef.current.removeEventListener('mousemove', onMouseMove)
  //     // uncomment the following line if not using `{ once: true }`
  //     // widgetRef.current.removeEventListener("mouseup", onMouseUp);
  //   }
  //   if (widgetRef && widgetRef.current && sectionRef) {
  //     setResizing(true)
  //     widgetRef.current.addEventListener('mousemove', onMouseMove)
  //     sectionRef.current.addEventListener('mouseup', onMouseUp, { once: true })
  //   }
  // }
  return (
    <div ref={widgetRef}>
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
              opacity: 1, //resizing ? 0.6 : 1,
              transform: `translate(${x}px, ${y}px)`
            }}
          >
            { !readOnly && <div className='card-actions'>
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
            </div>}
            { !readOnly && <div className='card-resizer' ref={sliderWrapperRef}>
              <div className='slider-mark'>
                {$t({ defaultMessage: 'Small' })}
              </div>
              <div className='slider'>
                <Slider
                  min={0}
                  max={sliderMax}
                  marks={sliderMarks}
                  value={card.currentSizeIndex}
                  tooltipVisible={false}
                  onChange={changeCardsLayout}
                />
              </div>
              <div className='slider-mark'>
                {$t({ defaultMessage: 'Large' })}
              </div>
            </div>}
            {
              card.chartType &&
              <WidgetChart
                data={card as unknown as WidgetListData}
                visible={visible}
                setVisible={setVisible}
                changeWidgetProperty={changeWidgetProperty}
              />
            }
            {/* <div className='resizeHandle' onMouseDown={(e) => {handler(e, card)}}/> */}
          </div>
      }
    </div>
  )
}
