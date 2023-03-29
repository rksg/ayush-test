import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart,
  getDeviceConnectionStatusColorsv2,
  GridCol, GridRow, StackedBarChart }    from '@acx-ui/components'
import type { DonutChartData }           from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { ChartData }                     from '@acx-ui/rc/utils'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

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
  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <UI.WidgetContainer style={{ height, width }}>
            <GridRow align={'middle'}>
              <GridCol col={{ span: 9 }}>
                { apTotalCount > 0
                  ? $t({ defaultMessage: 'Access Points' })
                  : $t({ defaultMessage: 'No Access Points' }) }
              </GridCol>
              <GridCol col={{ span: 15 }}>
                { apTotalCount > 0
                  ? <Space>
                    <StackedBarChart
                      animation={false}
                      style={{
                        height: height/2 - 30,
                        width: width/2 - 15
                      }}
                      data={apStackedData}
                      showLabels={false}
                      showTotal={false}
                      total={apTotalCount || 0}
                      barColors={getDeviceConnectionStatusColorsv2()} />
                    <TenantLink to={'/devices/wifi'}>
                      {apTotalCount || 0}
                    </TenantLink>
                  </Space>
                  : <UI.LinkContainer style={{ height: height/2 - 30 }}>
                    <TenantLink to={'/devices/wifi/add'}>
                      {$t({ defaultMessage: 'Add Access Point' })}
                    </TenantLink>
                  </UI.LinkContainer>
                }
              </GridCol>
            </GridRow>
            <GridRow align={'middle'}>
              <GridCol col={{ span: 9 }}>
                { switchTotalCount > 0
                  ? $t({ defaultMessage: 'Switches' })
                  : $t({ defaultMessage: 'No Switches' }) }
              </GridCol>
              <GridCol col={{ span: 15 }}>
                { switchTotalCount > 0
                  ? <Space>
                    <StackedBarChart
                      animation={false}
                      style={{
                        height: height/2 - 30,
                        width: width/2 - 15
                      }}
                      data={switchStackedData}
                      showLabels={false}
                      showTotal={false}
                      total={switchTotalCount || 0}
                      barColors={getDeviceConnectionStatusColorsv2()} />
                    <TenantLink to={'/devices/switch'}>
                      {switchTotalCount || 0}
                    </TenantLink>
                  </Space>
                  : <UI.LinkContainer style={{ height: (height/2) - 30 }}>
                    <TenantLink to={'/devices/switch/add'}>
                      {$t({ defaultMessage: 'Add Switch' })}
                    </TenantLink>
                  </UI.LinkContainer>
                }
              </GridCol>
            </GridRow>
          </UI.WidgetContainer>
        )}
      </AutoSizer>
    </Card>
  )
}
