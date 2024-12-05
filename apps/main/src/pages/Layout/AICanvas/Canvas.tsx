// @ts-nocheck
import React, { useEffect, useState } from 'react'

import { useDrop } from 'react-dnd'
import { useIntl }      from 'react-intl'

import { cssStr, Button } from '@acx-ui/components'

import * as UI     from './styledComponents'
import Layout                      from './components/Layout'
import mockData                    from './mock'
import utils       from './utils'
import WidgetChart from './WidgetChart'

export const ItemTypes = {
  WIDGET: 'widget'
}

const compactType = 'horizontal'

const layout = {
  containerWidth: 1200,
  containerHeight: 300, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

export default function Canvas (props) {
  const { $t } = useIntl()
  // const [widgets, setWidgets] = useState([])
  const [groups, setGroups] = useState([])
  const [sections, setSections] = useState([])
  
  useEffect(() => {
    const data = getFromLS()
    setSections(data)
    const group = data.reduce((acc, cur) => [...acc, ...cur.groups], [])
    setGroups(group)
  }, [])

  const getFromLS = () => {
    let ls = localStorage.getItem('acx-ui-dashboard') ?
      JSON.parse(localStorage.getItem('acx-ui-dashboard')) : mockData
    return mockData
  }

  const onClear = () => {
    setGroups([])
    setSections([])
  }

  // const [{ isOver }, dropRef] = useDrop({
  //   accept: ItemTypes.WIDGET,
  //   drop: (item) => {
  //     const dragItem = item
  //     const dropItem = props
  //     console.log('dragItem: ', dragItem)
  //     console.log('dropItem: ', dropItem)
  //     // dropCard(dragItem, dropItem)
  //     setWidgets([...widgets, dragItem])
  //   },
  //   collect: monitor => ({
  //     isOver: monitor.isOver()
  //   }),
  //   hover: (item, monitor) => {
  //     const dragItem = item
  //     console.log(item)
  //     if (dragItem.type === ItemTypes.WIDGET) {
  //       //卡片到组
  //       const hoverItem = props
  //       const { x, y } = monitor.getClientOffset()
  //       const containerDom = document.getElementById('grid')
  //       const groupItemBoundingRect = containerDom.getBoundingClientRect()
  //       const groupItemX = groupItemBoundingRect.left
  //       const groupItemY = groupItemBoundingRect.top
  //       console.log(hoverItem, ' x,y: ', groupItemX, ' ', groupItemY)
  //       // moveCardInGroupItem(
  //       //   hoverItem,
  //       //   x - groupItemX,
  //       //   y - groupItemY
  //       // )
  //     }
  //   }
  // })

  return (
    <UI.Canvas>
      <div className='header'>
        <div className='title'>
          <span>Canvas</span>
        </div>
        <div className='actions'>
          {/* <Button role='primary' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Publish' })}
          </Button>
          <Button role='primary' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button className='black' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button> */}
          <Button className='black' onClick={() => {onClear()}}>
            {$t({ defaultMessage: 'Clear' })}
          </Button>
        </div>
      </div>
      {/* <div className='grid' id='grid' ref={dropRef}>
        {
          widgets.map((widget, index) => <WidgetChart key={index} data={widget} />)
        }
      </div> */}
      <div className='grid' id='grid'>
        <UI.Grid>
          <Layout
            sections={sections}
            setSections={setSections}
            groups={groups}
            setGroups={setGroups}
            compactType={compactType}
            layout={layout}
          />
        </UI.Grid>
      </div>
    </UI.Canvas>
  )
}
