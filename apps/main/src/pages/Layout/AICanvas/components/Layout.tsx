// @ts-nocheck
import React, { useState, useEffect } from 'react'

import _                from 'lodash'
import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Tabs } from '@acx-ui/components'

import utils                                      from '../utils'
import { layoutCheck }                            from '../utils/collision'
import { compactLayout, compactLayoutHorizontal } from '../utils/compact'

import GroupItem from './GroupItem'

export default function Layout (props) {
  const defaultLayout = props.layout
  const { groups, setGroups, sections, setSections } = props
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
   * 关于卡片在组内的操作
   */
  /**
   * 拖拽中卡片在组上移动
   * @param {Object} hoverItem 拖拽中鼠标悬浮的对象
   * @param {Number} x 当前元素所在的网页的x轴位置，单位为px
   * @param {Number} y 当前元素所在的网页的y轴位置，单位为px
   **/
  const moveCardInGroupItem = (hoverItem, x, y) => {
    let groupsTmp = _.cloneDeep(groups)
    const { margin, containerWidth, col, rowHeight } = layout
    //计算当前所在的网格坐标
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

    //删除阴影的卡片
    _.forEach(groupsTmp, (g) => {
      _.remove(g.cards, (a) => {
        return a.isShadow === true
      })
    })

    const shadowCardTmp = { ...shadowCard, gridx: gridX, gridy: gridY }
    //添加阴影的卡片
    groupsTmp[groupIndex].cards.push(shadowCard)
    //获得当前分组内最新的layout布局
    const newlayout = layoutCheck(
      groupsTmp[groupIndex].cards,
      shadowCardTmp,
      shadowCardTmp.id,
      shadowCardTmp.id,
      props.compactType
    )
    //压缩当前分组内的layout布局
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
    //更新group对象
    groupsTmp[groupIndex].cards = compactedLayout
    setShadowCard(shadowCardTmp)
    setGroups(groupsTmp)
  }

  /**
   * 释放卡片到分组
   * @param {Object} dragItem 拖拽的卡片对象
   * @param {Object} dropItem 释放的目标组对象
   **/
  const onCardDropInGroupItem = () => {
    const groupsTmp = _.cloneDeep(groups)
    const { compactType } = props
    //将所有分组内的阴影卡片设为非阴影
    utils.setPropertyValueForCards(groupsTmp, 'isShadow', false)
    //目标组内重新横向压缩布局，由于跨组，故须全部压缩
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
              <Tabs type='card' stickyTop={false} defaultActiveKey={groups.find(g => g.sectionId == s.id && g.defaultTab)}>
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
