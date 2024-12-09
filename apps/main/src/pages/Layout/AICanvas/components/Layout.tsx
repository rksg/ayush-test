// @ts-nocheck
import { useState, useEffect } from 'react'

import _ from 'lodash'

import { Tabs } from '@acx-ui/components'

import utils                                      from '../utils'
import { layoutCheck }                            from '../utils/collision'
import { compactLayout, compactLayoutHorizontal } from '../utils/compact'

import GroupItem from './GroupItem'

export default function Layout (props) {
  const defaultLayout = props.layout
  const { groups, setGroups, sections } = props
  const [layout, setLayout] = useState(props.layout)
  const [shadowCard, setShadowCard] = useState({})
  const [resizeWaiter, setResizeWaiter] = useState(false)

  const handleLoad = () => {
    if (!resizeWaiter) {
      setResizeWaiter(true)
      setTimeout(() => {
        setResizeWaiter(false)
        let clientWidth
        const containerDom = document.querySelector('#card-container')
        if (containerDom) {
          clientWidth = containerDom.clientWidth
        } else {
          return
        }
        const { containerPadding, margin, col } = layout
        let tmpLayout = _.cloneDeep(layout)
        const calWidth = utils.calColWidth(
          clientWidth,
          col,
          containerPadding,
          margin
        )

        const tmpGroups = _.cloneDeep(groups)
        _.forEach(tmpGroups, (g) => {
          let compactedLayout = compactLayoutHorizontal(g.cards, col)
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
  const moveCardInGroupItem = (hoverItem, x, y) => {
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
    let groupIndex = hoverItem.index

    // Delete the shadowed card
    _.forEach(groupsTmp, (g) => {
      _.remove(g.cards, (a) => {
        return a.isShadow === true
      })
    })

    const shadowCardTmp = { ...shadowCard, gridx: gridX, gridy: gridY }
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
      compactedLayout = compactLayout(newlayout, shadowCardTmp)
    }
    // Update the group object
    groupsTmp[groupIndex].cards = compactedLayout
    setShadowCard(shadowCardTmp)
    setGroups(groupsTmp)
  }

  /**
   * Release the card into the group.
   **/
  const onCardDropInGroupItem = () => {
    const groupsTmp = _.cloneDeep(groups)
    const { compactType } = props
    // Remove shadows from all cards within all groups.
    utils.setPropertyValueForCards(groupsTmp, 'isShadow', false)
    // Recompress the layout horizontally within the target group, and due to cross-group dependencies, 
    // all groups must be compressed.
    _.forEach(groupsTmp, (g, i) => {
      if (compactType === 'horizontal') {
        let compactedLayout = compactLayoutHorizontal(
          groupsTmp[i].cards,
          layout.col
        )
        g.cards = compactedLayout
      } else if (compactType === 'vertical') {
        let compactedLayout = compactLayout(groupsTmp[i].cards)
        g.cards = compactedLayout
      }
    })
    setGroups(groupsTmp)
    setShadowCard({})
  }

  const deleteCard = (id, groupIndex) => {
    let cards = groups[groupIndex].cards.filter((item) => item.id !== id)
    let compactedLayout = compactLayoutHorizontal(cards, 4)
    groups[groupIndex].cards = compactedLayout
    const tmp = [...groups]
    setGroups(tmp)
  }

  return (
    <div>
      {
        sections.map((s) => <div className='section'>
          {/* <h2>Section {s.id}</h2> */}
          {
            s.hasTab ?
              <Tabs type='card'
                stickyTop={false}
                defaultActiveKey={groups.find(g => g.sectionId == s.id && g.defaultTab)}>
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
              <>
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
                  /> : <></>)
                }
              </>
          }
        </div>)
      }
    </div>
  )
}
