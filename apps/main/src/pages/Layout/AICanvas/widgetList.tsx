import React from 'react'

import { Card, DonutChart } from '@acx-ui/components'
import { WidgetData }       from '@acx-ui/rc/utils'

interface WidgetListProps {
  data: WidgetData[];
}

const WidgetList: React.FC<WidgetListProps> = ({ data }) => {
  return (
    <div>
      {data.map((item) => (
        <div style={{ marginTop: '15px' }}>
          <Card key={item.id}
            // eslint-disable-next-line max-len
            style={{ width: '100%', margin: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <DonutChart
              style={{ width: 160, height: 160 }}
              size={'medium'}
              data={item.chartOption}
              animation={true}
              legend={'name-value'}
              showTotal/>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default WidgetList;
