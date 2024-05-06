import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart,
  getDeviceConnectionStatusColorsv2,
  GridCol, GridRow, StackedBarChart }    from '@acx-ui/components'
import type { DonutChartData }                  from '@acx-ui/components'
import { TierFeatures, useIsTierAllowed }       from '@acx-ui/feature-toggle'
import { ChartData }                            from '@acx-ui/rc/utils'
import { TenantLink, useNavigateToPath }        from '@acx-ui/react-router-dom'
import { EdgeScopes, SwitchScopes, WifiScopes } from '@acx-ui/types'
import { filterByAccess, hasPermission }        from '@acx-ui/user'

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

  const edgeSupported = useIsTierAllowed(TierFeatures.SMART_EDGES)

  let numDonut = 2
  if (edgeSupported) {
    numDonut++
  }

  const clickWifiHandler = useNavigateToPath('/devices/wifi')
  const clickSwitchHandler = useNavigateToPath('/devices/switch')
  const clickSmartEdgeHandler = useNavigateToPath('/devices/edge')

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            { hasPermission({ scopes: [WifiScopes.READ] }) &&
            <UI.NavigationContainer onClick={clickWifiHandler}>
              <DonutChart
                key='wifi-donutChart'
                style={{ width: width/numDonut, height }}
                title={$t({ defaultMessage: 'Wi-Fi' })}
                data={props.apData}/>
            </UI.NavigationContainer>
            }
            { hasPermission({ scopes: [SwitchScopes.READ] }) &&
              <UI.NavigationContainer onClick={clickSwitchHandler}>
                <DonutChart
                  key='switch-donutChart'
                  style={{ width: width/numDonut, height }}
                  title={$t({ defaultMessage: 'Switch' })}
                  data={props.switchData}/>
              </UI.NavigationContainer>
            }
            { edgeSupported && hasPermission({ scopes: [EdgeScopes.READ] }) && (
              <UI.NavigationContainer onClick={clickSmartEdgeHandler}>
                <DonutChart
                  key='smartEdge-donutChart'
                  style={{ width: width/numDonut, height }}
                  title={$t({ defaultMessage: 'SmartEdge' })}
                  data={props.edgeData}/>
              </UI.NavigationContainer>)}
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}

export function DevicesWidgetv2 (props: {
  apStackedData: ChartData[],
  switchStackedData: ChartData[],
  edgeStackedData: ChartData[],
  apTotalCount: number,
  switchTotalCount: number,
  edgeTotalCount: number,
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')
  const edgeSupported = useIsTierAllowed(TierFeatures.SMART_EDGES)

  const {
    apStackedData,
    switchStackedData,
    edgeStackedData,
    apTotalCount,
    switchTotalCount,
    edgeTotalCount
  } = props

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <UI.WidgetContainer style={{ height, width }}>
            { hasPermission({ scopes: [WifiScopes.READ] })
              && <GridRow align={'middle'}>
                <GridCol col={{ span: apTotalCount ? 9 : 12 }}>
                  { apTotalCount > 0
                    ? $t({ defaultMessage: 'Access Points' })
                    : $t({ defaultMessage: 'No Access Points' }) }
                </GridCol>
                <GridCol col={{ span: apTotalCount ? 15 : 12 }}>
                  { apTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='ap-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - 30,
                          width: width/2 - 15
                        }}
                        data={apStackedData}
                        showLabels={false}
                        showTotal={false}
                        total={apTotalCount}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink key='ap-tenantLink' to={'/devices/wifi'}>
                        {apTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer key='ap-linkContainer' style={{ height: height/2 - 30 }}>
                      {filterByAccess([<TenantLink to={'/devices/wifi/add'}>
                        {$t({ defaultMessage: 'Add Access Point' })}
                      </TenantLink>])}
                    </UI.LinkContainer>
                  }
                </GridCol>
              </GridRow>
            }
            { hasPermission({ scopes: [SwitchScopes.READ] })
              && <GridRow align={'middle'}>
                <GridCol col={{ span: switchTotalCount ? 9 : 12 }}>
                  { switchTotalCount > 0
                    ? $t({ defaultMessage: 'Switches' })
                    : $t({ defaultMessage: 'No Switches' }) }
                </GridCol>
                <GridCol col={{ span: switchTotalCount ? 15 : 12 }}>
                  { switchTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='switch-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - 30,
                          width: width/2 - 15
                        }}
                        data={switchStackedData}
                        showLabels={false}
                        showTotal={false}
                        total={switchTotalCount}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink key='switch-tenantLink' to={'/devices/switch'}>
                        {switchTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer
                      key='switch-linkContainer'
                      style={{ height: (height/2) - 30 }}>
                      {filterByAccess([<TenantLink to={'/devices/switch/add'}>
                        {$t({ defaultMessage: 'Add Switch' })}
                      </TenantLink>])}
                    </UI.LinkContainer>
                  }
                </GridCol>
              </GridRow>
            }
            { edgeSupported && hasPermission({ scopes: [EdgeScopes.READ] }) &&
              <GridRow align={'middle'}>
                <GridCol col={{ span: edgeTotalCount ? 9 : 12 }}>
                  { edgeTotalCount > 0
                    ? $t({ defaultMessage: 'SmartEdges' })
                    : $t({ defaultMessage: 'No SmartEdges' }) }
                </GridCol>
                <GridCol col={{ span: edgeTotalCount ? 15 : 12 }}>
                  { edgeTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='edge-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - 30,
                          width: width/2 - 15
                        }}
                        data={edgeStackedData}
                        showLabels={false}
                        showTotal={false}
                        total={edgeTotalCount}
                        barColors={getDeviceConnectionStatusColorsv2()} />
                      <TenantLink key='edge-tenantLink' to={'/devices/edge'}>
                        {edgeTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer
                      key='edge-linkContainer'
                      style={{ height: (height/2) - 30 }}>
                      {filterByAccess([<TenantLink
                        to={'/devices/edge/add'}>
                        {$t({ defaultMessage: 'Add SmartEdge' })}
                      </TenantLink>])}
                    </UI.LinkContainer>
                  }
                </GridCol>
              </GridRow>
            }
          </UI.WidgetContainer>
        )}
      </AutoSizer>
    </Card>
  )
}
