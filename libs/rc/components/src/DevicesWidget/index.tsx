import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart, getDeviceConnectionStatusColorsv2, GridCol, GridRow, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { ChartData }                                                                              from '@acx-ui/rc/utils'
import { useNavigateToPath }                                                                      from '@acx-ui/react-router-dom'

export  { seriesMappingAP } from './helper'

export function DevicesWidget (props: {
  apData: DonutChartData[],
  switchData: DonutChartData[],
  edgeData: DonutChartData[],
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')

  const edgeSupported = useIsSplitOn(Features.EDGES)

  let numDonut = 2
  if (edgeSupported) {
    numDonut++
  }

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            <DonutChart
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
              data={props.edgeData}/>)}
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}

export function DevicesWidgetv2 (props: {
  apStackedData: ChartData[],
  switchStackedData: ChartData[],
  apTotalCount: number,
  switchTotalCount: number,
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')

  // const edgeSupported = useIsSplitOn(Features.EDGES)
  const marginTop = '13px'
  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'block', height, width }}>
            <GridRow style={{ marginTop: '30px' }}>
              <GridCol col={{ span: 9 }} style={{ marginTop: marginTop }}>
                Access Points
              </GridCol>
              <GridCol col={{ span: 13 }}>
                <StackedBarChart
                  style={{ height: (height/2) - 30 }}
                  data={props.apStackedData!}
                  showLabels={false}
                  showTotal={false}
                  barColors={getDeviceConnectionStatusColorsv2()} />
              </GridCol>
              <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                {props.apTotalCount}
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 9 }} style={{ marginTop: marginTop }}>
                Switches
              </GridCol>
              <GridCol col={{ span: 13 }}>
                <StackedBarChart
                  style={{ height: (height/2) - 30 }}
                  data={props.switchStackedData!}
                  showLabels={false}
                  showTotal={false}
                  barColors={getDeviceConnectionStatusColorsv2()} />
              </GridCol>
              <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                {props.switchTotalCount}
              </GridCol>
            </GridRow>
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
