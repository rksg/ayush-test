import React from 'react'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart } from '@acx-ui/components'
import { WidgetData, WidgetListData }       from '@acx-ui/rc/utils'
import { useChatChartQuery } from '@acx-ui/rc/services';

interface WidgetListProps {
  data: WidgetListData;
}

const WidgetChart: React.FC<WidgetListProps> = ({ data }) => {
  // const queryResults = useChatChartQuery({
  //   params: {
  //     sessionId: data.sessionId,
  //     id: data.id
  //   },
  // })
  const queryResults = {
   data: {
    chartOption: [
      {"name":"Requires Attention","value":1,"color":"#ED1C24"},
      {"name":"In Setup Phase","value":64,"color":"#ACAEB0"},
      {"name":"Operational","value":1,"color":"#23AB36"}
    ]
   }
  }
  return (
    <div>
 
        <div style={{ marginTop: '15px', height: '170px' }}>
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
        </div>
    </div>
  )
}

export default WidgetChart;
