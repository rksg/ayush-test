import React from 'react'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart, Loader } from '@acx-ui/components'
import { WidgetData, WidgetListData }       from '@acx-ui/rc/utils'
import { useChatChartQuery } from '@acx-ui/rc/services';
import { useDrag } from 'react-dnd';

interface WidgetListProps {
  data: WidgetListData;
}

const DraggableChart = () =>{

}

// const DraggableCard = (props) => {
//   const [{ isDragging }, drag, preview] = useDrag({
//     type: ItemTypes.CARD,
//     item: () => {
//       let dragCard = props.card
//       dragCard.isShadow = true
//       props.updateShadowCard(dragCard)
//       return { id: props.id, type: props.type }
//     },
//     end: (item, monitor) => {
//       if (!monitor.didDrop()) {
//         props.dropCard(item, props.group)
//       }
//     }
//   })
//   const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }))

//   useEffect(() => {
//     preview(getEmptyImage(), { captureDraggingState: true })
//   }, [preview])

//   return (
//     <div>
//       <Card
//         {...props}
//         isDragging={isDragging}
//         drop={drop}
//         drag={drag}
//       />
//     </div>
//   )
// }

const WidgetChart: React.FC<WidgetListProps> = ({ data }) => {
  const queryResults = useChatChartQuery({
    params: {
      sessionId: data.sessionId,
      chatId: data.id
    },
  })
  // const queryResults = {
  //  data: {
  //   chartOption: [
  //     {"name":"Requires Attention","value":1,"color":"#ED1C24"},
  //     {"name":"In Setup Phase","value":64,"color":"#ACAEB0"},
  //     {"name":"Operational","value":1,"color":"#23AB36"}
  //   ]
  //  }
  // }
  return (
    <div>
        <div style={{ marginTop: '15px', height: '170px' }}>
        <Loader states={[queryResults]}>
          <Card key={data.id} title="Title">
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
        </Loader>
        </div>
    </div>
  )
}

export default WidgetChart;
