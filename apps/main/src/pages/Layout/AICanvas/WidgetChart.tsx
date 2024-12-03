import React, { useEffect } from 'react'

import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage }    from 'react-dnd-html5-backend'
import AutoSizer            from 'react-virtualized-auto-sizer'

import { Card, DonutChart, Loader }   from '@acx-ui/components'
import { useChatChartQuery }          from '@acx-ui/rc/services'
import { WidgetData, WidgetListData } from '@acx-ui/rc/utils'

interface WidgetListProps {
  data: WidgetListData;
}

const DraggableChart: React.FC<WidgetListProps> = ({ data }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'Widget',
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <WidgetChart data={data} />
    </div>
  )
}

const WidgetChart: React.FC<WidgetListProps> = ({ data }) => {
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
    <div>
      <div style={{ margin: '7px', height: '165px', width: '200px' }}>
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
      </div>
    </div>
  )
}

export default WidgetChart
