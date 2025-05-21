import { useState, useEffect } from 'react'

import _ from 'lodash'

// import { Tabs } from '@acx-ui/components'

import { useCreateWidgetMutation } from '@acx-ui/rc/services'

import { Section, Group, LayoutConfig, CardInfo } from '../Canvas'
import utils                                      from '../utils'
import { layoutCheck }                            from '../utils/collision'
import { compactLayout, compactLayoutHorizontal } from '../utils/compact'

import GroupItem, { GroupProps } from './GroupItem'

export interface LayoutProps {
  layout: LayoutConfig
  sections: Section[]
  groups: Group[]
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>
  compactType: string
  canvasId: string,
  setLayout: React.Dispatch<React.SetStateAction<LayoutConfig>>
  shadowCard: CardInfo
  setShadowCard: React.Dispatch<React.SetStateAction<CardInfo>>
  readOnly?: boolean
  containerId?: string
}

export default function Layout (props: LayoutProps) {
  const defaultLayout = props.layout
  // eslint-disable-next-line max-len
  const {
    groups, setGroups, sections, canvasId, layout, setLayout, shadowCard, setShadowCard,
    containerId = 'card-container', readOnly
  } = props
  const [resizeWaiter, setResizeWaiter] = useState(false)
  const [createWidget] = useCreateWidgetMutation()

  const handleLoad = () => {
    if (!resizeWaiter) {
      setResizeWaiter(true)
      setTimeout(() => {
        setResizeWaiter(false)
        let clientWidth
        const containerDom = document.querySelector(`#${containerId}`)
        if (containerDom) {
          clientWidth = containerDom.clientWidth
        } else {
          return
        }
        const { containerPadding, margin } = layout
        // const windowWidth = window.innerWidth - 60 * 2
        // utils.calColCount(defaultLayout.calWidth, windowWidth, containerPadding, margin)
        const col = utils.calColCount()
        let tmpLayout = _.cloneDeep(layout)
        const calWidth = utils.calColWidth(
          clientWidth,
          col,
          containerPadding,
          margin
        )

        const tmpGroups = _.cloneDeep(groups)
        _.forEach(tmpGroups, (g) => {
          let compactedLayout = compactLayoutHorizontal(g.cards, col, null)
          g.cards = compactedLayout
        })

        tmpLayout.calWidth = calWidth
        tmpLayout.col = col
        tmpLayout.containerWidth = clientWidth
        setGroups(tmpGroups)
        setLayout(tmpLayout)
      }, 500)
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleLoad)
    return () => window.removeEventListener('resize', handleLoad)
  }, [handleLoad])

  /*
   * About the operations of cards within a group.
   */
  /**
   * A card moves within a group during a drag operation.
   * @param {Object} hoverItem The object that the mouse is hovering over during the drag operation.
   * @param {Number} x The x-coordinate of the current element on the canvas, in pixels.
   * @param {Number} y The y-coordinate of the current element on the canvas, in pixels.
   **/
  const moveCardInGroupItem = (hoverItem:GroupProps, x:number, y:number) => {
    let groupsTmp = _.cloneDeep(groups)
    const { margin, containerWidth, col, rowHeight } = layout
    // Calculate the current grid coordinates
    const { gridX, gridY } = utils.calGridXY(
      x,
      y,
      shadowCard.width,
      margin,
      containerWidth,
      col,
      rowHeight
    )
    if (gridX === shadowCard.gridx && gridY === shadowCard.gridy) {
      return
    }

    // Delete the shadowed card
    _.forEach(groupsTmp, (g) => {
      _.remove(g.cards, (a) => {
        return a.isShadow === true
      })
    })

    let groupIndex = hoverItem.index
    const shadowCardTmp = { ...shadowCard, gridx: gridX, gridy: gridY, groupIndex }

    if(typeof groupIndex == 'number') {
      // Add the shadowed card
      groupsTmp[groupIndex].cards.push(shadowCard)
      // Get the latest layout within the current group
      const newlayout = layoutCheck(
        groupsTmp[groupIndex].cards,
        shadowCardTmp,
        shadowCardTmp.id,
        shadowCardTmp.id,
        props.compactType
      )
      // Compress the layout within the current group.
      let compactedLayout
      if (props.compactType === 'horizontal') {
        compactedLayout = compactLayoutHorizontal(
          newlayout,
          col,
          shadowCardTmp.id
        )
      } else if (props.compactType === 'vertical') {
        compactedLayout = compactLayout(newlayout)
      }
      // Update the group object
      groupsTmp[groupIndex].cards = compactedLayout as CardInfo[]
      setShadowCard(shadowCardTmp)
      setGroups(groupsTmp)
    }
  }

  /**
   * Release the card into the group.
   **/
  const onCardDropInGroupItem = async () => {
    const groupsTmp = _.cloneDeep(groups)
    const { compactType } = props
    if(!shadowCard.widgetId) {
      await createWidget({
        params: {
          canvasId
        },
        payload: {
          messageId: shadowCard.chatId
        }
      }).then((response)=> {
        if(response?.data?.id) {
          groupsTmp.forEach(g => {
            g.cards.forEach(c => {
              if(c.id == shadowCard.id) {
                c.widgetId = response.data.id
                c.name = response.data.name
                c.timeRange = response.data.defaultTimeRange
                c.canvasId = canvasId
              }
            })
          })
        }else {
          groupsTmp[shadowCard.groupIndex].cards = groupsTmp[shadowCard.groupIndex].cards
            .filter((item) => item.id !== shadowCard.id)
        }
      })
    }
    // Remove shadows from all cards within all groups.
    utils.setPropertyValueForCards(groupsTmp, 'isShadow', false)
    // Recompress the layout horizontally within the target group, and due to cross-group dependencies,
    // all groups must be compressed.
    _.forEach(groupsTmp, (g, i) => {
      if (compactType === 'horizontal') {
        let compactedLayout = compactLayoutHorizontal(
          groupsTmp[i].cards,
          layout.col, null
        )
        g.cards = compactedLayout
      } else if (compactType === 'vertical') {
        let compactedLayout = compactLayout(groupsTmp[i].cards)
        g.cards = compactedLayout
      }
    })
    setGroups(groupsTmp)
    setShadowCard({} as CardInfo)
  }

  const deleteCard = (id: string, groupIndex:number) => {
    const groupsTmp = _.cloneDeep(groups)
    let cards = groupsTmp[groupIndex].cards.filter((item) => item.id !== id)
    let compactedLayout = compactLayoutHorizontal(cards, 4, null)
    groupsTmp[groupIndex].cards = compactedLayout
    setGroups(groupsTmp)
  }

  return (
    <div>
      {
        sections.map((s) => <div className='section' key={s.id}>
          {/* <h2>Section {s.id}</h2> */}
          {/* {
            s.hasTab ?
              <Tabs type='card'
                stickyTop={false}
                defaultActiveKey={groups.find(g => g.sectionId == s.id && g.defaultTab)?.tabValue}>
                {
                  groups.map((g, i) => g.sectionId == s.id ?
                    <Tabs.TabPane tab={g.tabLabel} key={g.tabValue}>
                      <GroupItem
                        key={g.id}
                        id={g.id}
                        type={g.type}
                        index={i}
                        cards={g.cards}
                        length={groups.length}
                        groups={groups}
                        moveCardInGroupItem={moveCardInGroupItem}
                        onCardDropInGroupItem={onCardDropInGroupItem}
                        layout={layout}
                        defaultLayout={defaultLayout}
                        shadowCard={shadowCard}
                        updateShadowCard={setShadowCard}
                        updateGroupList={setGroups}
                        handleLoad={handleLoad}
                        deleteCard={deleteCard}
                      />
                    </Tabs.TabPane> : <></>)
                }
              </Tabs>
              :
              <> */}
          {
            groups.map((g, i) => g.sectionId == s.id ? <GroupItem
              key={g.id}
              id={g.id}
              type={g.type}
              index={i}
              cards={g.cards}
              length={groups.length}
              groups={groups}
              moveCardInGroupItem={moveCardInGroupItem}
              onCardDropInGroupItem={onCardDropInGroupItem}
              layout={layout}
              defaultLayout={defaultLayout}
              shadowCard={shadowCard}
              updateShadowCard={setShadowCard}
              updateGroupList={setGroups}
              handleLoad={handleLoad}
              deleteCard={deleteCard}
              draggable={!readOnly}
              containerId={containerId}
            /> : <></>)
          }
          {/* </>
          } */}
        </div>)
      }
    </div>
  )
}
