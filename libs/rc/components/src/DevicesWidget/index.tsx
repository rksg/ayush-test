import { Space }   from 'antd'
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
              <GridCol col={{ span: 9 }} style={{ marginTop: marginTop }}>
                { apTotalCount > 0
                  ? $t({ defaultMessage: 'Access Points' })
                  : $t({ defaultMessage: 'No Access Points' }) }
              </GridCol>
              <GridCol col={{ span: 15 }}>
                <Space>
                  { apTotalCount > 0
                    ? <>
                      <StackedBarChart
                        animation={false}
                        style={{
                          height: height / 2 - 30,
                          width: width / 2 - 15,
                          minWidth: width / 2 - 15
                        }}
                        data={apStackedData}
                        showLabels={false}
                        showTotal={false}
                        totalValue={apTotalCount || 0}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink to={'/devices/wifi'}>
                        {apTotalCount || 0}
                      </TenantLink>
                    </>
                    : <div style={{ height: (height/2) - 30, paddingTop: '13px' }}>
                      <TenantLink to={'/devices/wifi/add'}>
                        {$t({ defaultMessage: 'Add Access Point' })}
                      </TenantLink>
                    </div>
                  }
                </Space>
              </GridCol>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 9 }} style={{ marginTop: marginTop }}>
                { switchTotalCount > 0
                  ? $t({ defaultMessage: 'Switches' })
                  : $t({ defaultMessage: 'No Switches' }) }
              </GridCol>
              <GridCol col={{ span: 15 }}>
                <Space>
                  { switchTotalCount > 0
                    ? <>
                      <StackedBarChart
                        animation={false}
                        style={{
                          height: height/2 - 30,
                          width: width/2 - 15,
                          minWidth: width/2 - 15
                        }}
                        data={switchStackedData}
                        showLabels={false}
                        showTotal={false}
                        totalValue={switchTotalCount || 0}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink to={'/devices/wifi'}>
                        {switchTotalCount || 0}
                      </TenantLink>
                    </>
                    : <div style={{ height: (height/2) - 30, paddingTop: '13px' }}>
                      <TenantLink to={'/devices/switch'}>
                        {$t({ defaultMessage: 'Add Switch' })}
                      </TenantLink>
                    </div>
                  }
                </Space>
              </GridCol>
            </GridRow>
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}
