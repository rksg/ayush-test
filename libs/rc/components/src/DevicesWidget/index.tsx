import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart, getDeviceConnectionStatusColorsv2, GridCol, GridRow, StackedBarChart } from '@acx-ui/components'
import type { DonutChartData }                                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { ChartData }                                                                              from '@acx-ui/rc/utils'
import { TenantLink, useNavigateToPath }                                                          from '@acx-ui/react-router-dom'

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
  const { apStackedData,switchStackedData,apTotalCount,switchTotalCount } = props
  const marginTop = '13px'
  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'block', height, width }}>
            <GridRow style={{ marginTop: '30px' }}>
              <GridCol col={{ span: 11 }} style={{ marginTop: marginTop }}>
                { apTotalCount > 0 ? $t({ defaultMessage: 'Access Points' })
                  : $t({ defaultMessage: 'No Access Points' }) }
              </GridCol>
              <GridCol col={{ span: 11 }}>
                { apTotalCount > 0 ? <StackedBarChart
                  style={{ height: (height/2) - 30 }}
                  data={apStackedData}
                  showLabels={false}
                  showTotal={false}
                  barColors={getDeviceConnectionStatusColorsv2()} />
                  : <div style={{ height: (height/2) - 30,
                    paddingTop: '13px' }}><TenantLink to={'/devices/wifi/add'}>
                      {$t({ defaultMessage: 'Add Access Point' })}</TenantLink></div>}
              </GridCol>
              <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                {apTotalCount || ''}
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 11 }} style={{ marginTop: marginTop }}>
                { switchTotalCount > 0 ? $t({ defaultMessage: 'Switches' })
                  : $t({ defaultMessage: 'No Switches' }) }
              </GridCol>
              <GridCol col={{ span: 11 }}>
                { switchTotalCount > 0 ? <StackedBarChart
                  style={{ height: (height/2) - 30 }}
                  data={switchStackedData}
                  showLabels={false}
                  showTotal={false}
                  barColors={getDeviceConnectionStatusColorsv2()} />
                  : <div style={{ height: (height/2) - 30,
                    paddingTop: '13px' }}><TenantLink to={'/devices/switch/add'}>
                      {$t({ defaultMessage: 'Add Switch' })}</TenantLink></div>}
              </GridCol>
              <GridCol col={{ span: 2 }} style={{ marginTop: marginTop, marginLeft: '-13px' }}>
                {switchTotalCount || ''}
              </GridCol>
            </GridRow>
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
