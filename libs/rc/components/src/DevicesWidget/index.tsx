import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart, getDeviceConnectionStatusColors, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { ChartData }                                                          from '@acx-ui/rc/utils'
import { useNavigateToPath }                                                  from '@acx-ui/react-router-dom'

export  { seriesMappingAP } from './helper'

export function DevicesWidget (props: {
  apData: DonutChartData[],
  apStackedData?: ChartData[],
  switchData: DonutChartData[],
  edgeData: DonutChartData[],
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')

  // const edgeSupported = useIsSplitOn(Features.EDGES)

  // let numDonut = 2
  // if (edgeSupported) {
  //   numDonut++
  // }

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            <StackedBarChart
              style={{ width: width, height }}
              data={props.apStackedData!}
              barColors={getDeviceConnectionStatusColors()}
            />
            {/* <DonutChart
              style={{ width: width/numDonut, height }}
              title={$t({ defaultMessage: 'Wi-Fi' })}
              data={props.apData}/>
            <DonutChart
              style={{ width: width/numDonut, height }}
              title={$t({ defaultMessage: 'Switch' })}
              data={props.switchData}/>
            { edgeSupported && (<DonutChart
              style={{ width: width/numDonut, height }}
              title={$t({ defaultMessage: 'SmartEdge' })}
              data={props.edgeData}/>)} */}
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
