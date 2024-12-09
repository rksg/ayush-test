import React, { useEffect } from 'react'

import { useDrag } from 'react-dnd'
import { getEmptyImage }    from 'react-dnd-html5-backend'
import AutoSizer            from 'react-virtualized-auto-sizer'
import { v4 as uuidv4 }     from 'uuid'

import { Card, DonutChart, Loader }   from '@acx-ui/components'
import { useChatChartQuery }          from '@acx-ui/rc/services'
import { WidgetListData } from '@acx-ui/rc/utils'
import { ItemTypes } from './GroupItem'

interface WidgetListProps {
  data: WidgetListData;
}

const PIE = {
  width: 1,
  height: 4,
  currentSizeIndex: 0,
  sizes: [
    {
      width: 1,
      height: 4
    },
    {
      width: 2,
      height: 6
    },
    {
      width: 4,
      height: 9
    }
  ]
}

const ChartConfig:{[key:string]: any} = {
  pie: PIE
}

export const DraggableChart: React.FC<WidgetListProps> = ({ data }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    item: () => {
      const dragCard = {
        ...data,
        id: data.id + uuidv4(),
        type: ItemTypes.CARD,
        isShadow: true,
        ...(data.chartType? ChartConfig[data.chartType] : [])
      }
      return dragCard
    }
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div style={{ margin: '7px', height: '165px', width: '200px' }}>
        <WidgetChart data={data} />
      </div>
    </div>
  )
}

export const WidgetChart: React.FC<WidgetListProps> = ({ data }) => {
  // const queryResults = useChatChartQuery({
  //   params: {
  //     sessionId: data.sessionId,
  //     chatId: data.id
  //   },
  // })
  const queryResults = {
    data: {
      chartOption: [
        { name: 'Requires Attention',value: 1,color: '#ED1C24' },
        { name: 'In Setup Phase',value: 64,color: '#ACAEB0' },
        { name: 'Operational',value: 1,color: '#23AB36' }
      ]
    }
  }
  return (
    <>
      {/* <Loader states={[{isLoading: queryResults.isLoading}]}> */}
      <Card key={data.id} title='Title'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              size={'medium'}
              data={queryResults.data?.chartOption || []}
              animation={true}
              legend={'name-value'}
              showTotal/>
          )}
        </AutoSizer>
      </Card>
      {/* </Loader> */}
    </>

  )
}

