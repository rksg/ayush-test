import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card,
  DonutChart,
  getDeviceConnectionStatusColorsv2,
  GridCol,
  GridRow,
  StackedBarChart }    from '@acx-ui/components'
import type { DonutChartData }    from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ChartData,
  CommonRbacUrlsInfo,
  IotUrlsInfo,
  EdgeUrlsInfo,
  SwitchRbacUrlsInfo,
  WifiRbacUrlsInfo
}                                       from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigateToPath,
  useParams
}        from '@acx-ui/react-router-dom'
import {
  EdgeScopes,
  RolesEnum,
  SwitchScopes,
  WifiScopes
} from '@acx-ui/types'
import {
  filterByAccess,
  hasRoles,
  useUserProfileContext
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { useIsEdgeReady } from '../useEdgeActions'

import * as UI from './styledComponents'

export  { seriesMappingAP } from './helper'

export function DevicesWidget (props: {
  apData: DonutChartData[],
  switchData: DonutChartData[],
  edgeData: DonutChartData[],
  rwgData: DonutChartData[],
  iotControllerData: DonutChartData[],
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')
  const { isCustomRole } = useUserProfileContext()

  const isEdgeEnabled = useIsEdgeReady()
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole
  const showIotControllerUI = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)

  // `2` refers to the AP and Switch
  const numDonut = [
    isEdgeEnabled,
    showRwgUI && rwgHasPermission,
    showIotControllerUI
  ].filter(Boolean).length + 2

  const { venueId } = useParams()

  const getNavigatePath = (deviceType: string) => {
    return (venueId)
      ? `/venues/${venueId}/venue-details/devices/${deviceType}`
      : `/devices/${deviceType}`
  }

  const clickWifiHandler = useNavigateToPath(getNavigatePath('wifi'))
  const clickSwitchHandler = useNavigateToPath(getNavigatePath('switch'))
  const clickSmartEdgeHandler = useNavigateToPath(getNavigatePath('edge'))
  const clickRwgHandler = useNavigateToPath(getNavigatePath('rwg'))
  const clickIotControllerHandler = useNavigateToPath(getNavigatePath('iotController'))

  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ display: 'inline-flex' }}>
            <UI.NavigationContainer onClick={clickWifiHandler}>
              <DonutChart
                key='wifi-donutChart'
                style={{ width: width/numDonut, height }}
                title={$t({ defaultMessage: 'Wi-Fi' })}
                data={props.apData}/>
            </UI.NavigationContainer>
            <UI.NavigationContainer onClick={clickSwitchHandler}>
              <DonutChart
                key='switch-donutChart'
                style={{ width: width/numDonut, height }}
                title={$t({ defaultMessage: 'Switch' })}
                data={props.switchData}/>
            </UI.NavigationContainer>
            { isEdgeEnabled && (
              <UI.NavigationContainer onClick={clickSmartEdgeHandler}>
                <DonutChart
                  key='smartEdge-donutChart'
                  style={{ width: width/numDonut, height }}
                  title={$t({ defaultMessage: 'RUCKUS Edge' })}
                  data={props.edgeData}/>
              </UI.NavigationContainer>)}
            { showRwgUI && rwgHasPermission && (
              <UI.NavigationContainer onClick={clickRwgHandler}>
                <DonutChart
                  key='rwg-donutChart'
                  style={{ width: width/numDonut, height }}
                  title={$t({ defaultMessage: 'RWG' })}
                  data={props.rwgData}/>
              </UI.NavigationContainer>)}
            { showIotControllerUI && (
              <UI.NavigationContainer onClick={clickIotControllerHandler}>
                <DonutChart
                  key='iot-controller-donutChart'
                  style={{ width: width/numDonut, height }}
                  title={$t({ defaultMessage: 'IoT' })}
                  data={props.iotControllerData}/>
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
  rwgStackedData: { chartData: ChartData[], stackedColors: string[] },
  iotControllerStackedData: { chartData: ChartData[], stackedColors: string[] },
  apTotalCount: number,
  switchTotalCount: number,
  edgeTotalCount: number,
  rwgTotalCount: number,
  iotControllerTotalCount: number,
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')
  const { isCustomRole } = useUserProfileContext()
  const isEdgeEnabled = useIsEdgeReady()
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole
  const showIotControllerUI = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)

  const {
    apStackedData,
    switchStackedData,
    edgeStackedData,
    rwgStackedData,
    iotControllerStackedData,
    apTotalCount,
    switchTotalCount,
    edgeTotalCount,
    rwgTotalCount,
    iotControllerTotalCount
  } = props

  const numRow = [
    isEdgeEnabled,
    showRwgUI && rwgHasPermission,
    showIotControllerUI
  ].filter(Boolean).length + 2


  return (
    <Card title={$t({ defaultMessage: 'Devices' })}
      onArrowClick={props.enableArrowClick ? onArrowClick : undefined}>
      <AutoSizer>
        {({ height, width }) => (
          <UI.WidgetContainer style={{ height, width }}>
            <GridRow align={'middle'}>
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
                        height: height/2 - (10 * (numRow - 1)),
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
                  // eslint-disable-next-line max-len
                  : <UI.LinkContainer key='ap-linkContainer' style={{ height: height/2 - (10 * (numRow - 1)) }}>
                    {filterByAccess([
                      <TenantLink
                        scopeKey={[WifiScopes.CREATE]}
                        rbacOpsIds={[getOpsApi(WifiRbacUrlsInfo.addAp)]}
                        to={'/devices/wifi/add'}>
                        {$t({ defaultMessage: 'Add Access Point' })}
                      </TenantLink>
                    ])}
                  </UI.LinkContainer>
                }
              </GridCol>
            </GridRow>
            <GridRow align={'middle'}>
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
                        height: height/2 - (10 * (numRow - 1)),
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
                    style={{ height: (height/2) - (10 * (numRow - 1)) }}>
                    {filterByAccess([
                      <TenantLink
                        to={'/devices/switch/add'}
                        rbacOpsIds={[getOpsApi(SwitchRbacUrlsInfo.addSwitch)]}
                        scopeKey={[SwitchScopes.CREATE]}>
                        {$t({ defaultMessage: 'Add Switch' })}
                      </TenantLink>
                    ])}
                  </UI.LinkContainer>
                }
              </GridCol>
            </GridRow>
            { isEdgeEnabled &&
              <GridRow align={'middle'}>
                <GridCol col={{ span: edgeTotalCount ? 9 : 12 }}>
                  { edgeTotalCount > 0
                    ? $t({ defaultMessage: 'RUCKUS Edges' })
                    : $t({ defaultMessage: 'No RUCKUS Edges' }) }
                </GridCol>
                <GridCol col={{ span: edgeTotalCount ? 15 : 12 }}>
                  { edgeTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='edge-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - (10 * (numRow - 1)),
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
                      style={{ height: (height/2) - (10 * (numRow - 1)) }}>
                      {filterByAccess([<TenantLink
                        scopeKey={[EdgeScopes.CREATE]}
                        rbacOpsIds={[
                          [
                            getOpsApi(EdgeUrlsInfo.addEdge),
                            getOpsApi(EdgeUrlsInfo.addEdgeCluster)
                          ]
                        ]}
                        to={'/devices/edge/add'}>
                        {$t({ defaultMessage: 'Add RUCKUS Edge' })}
                      </TenantLink>])}
                    </UI.LinkContainer>
                  }
                </GridCol>
              </GridRow>
            }
            {
              showRwgUI && rwgHasPermission && <GridRow align={'middle'}>
                <GridCol col={{ span: rwgTotalCount ? 9 : 12 }}>
                  { rwgTotalCount > 0
                    ? $t({ defaultMessage: 'RWGs' })
                    : $t({ defaultMessage: 'No RWGs' }) }
                </GridCol>
                <GridCol col={{ span: rwgTotalCount ? 9 : 12 }}>
                  { rwgTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='rwg-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - (10 * (numRow - 1)),
                          width: width/2 - 15
                        }}
                        data={rwgStackedData.chartData}
                        showLabels={false}
                        showTotal={false}
                        total={rwgTotalCount}
                        barColors={rwgStackedData.stackedColors} />
                      <TenantLink key='rwg-tenantLink' to={'/ruckus-wan-gateway'}>
                        {rwgTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer
                      key='rwg-linkContainer'
                      style={{ height: (height/2) - (10 * (numRow - 1)) }}>
                      {!isCustomRole && filterByAccess([
                        <TenantLink to={'/ruckus-wan-gateway/add'}
                          rbacOpsIds={[getOpsApi(CommonRbacUrlsInfo.addGateway)]}>
                          {$t({ defaultMessage: 'Add RWG' })}
                        </TenantLink>])}
                    </UI.LinkContainer>
                  }
                </GridCol>
              </GridRow>
            }
            {
              showIotControllerUI && <GridRow align={'middle'}>
                <GridCol col={{ span: iotControllerTotalCount ? 9 : 12 }}>
                  { iotControllerTotalCount > 0
                    ? $t({ defaultMessage: 'IoT Controllers' })
                    : $t({ defaultMessage: 'No IoT Controllers' }) }
                </GridCol>
                <GridCol col={{ span: iotControllerTotalCount ? 9 : 12 }}>
                  { iotControllerTotalCount > 0
                    ? <Space>
                      <StackedBarChart
                        key='iotController-stackedBarChart'
                        animation={false}
                        style={{
                          height: height/2 - (10 * (numRow - 1)),
                          width: width/2 - 15
                        }}
                        data={iotControllerStackedData.chartData}
                        showLabels={false}
                        showTotal={false}
                        total={iotControllerTotalCount}
                        barColors={iotControllerStackedData.stackedColors} />
                      <TenantLink key='iotController-tenantLink' to={'/devices/iotController'}>
                        {iotControllerTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer
                      key='iotController-linkContainer'
                      style={{ height: (height/2) - (10 * (numRow - 1)) }}>
                      {!isCustomRole && filterByAccess([
                        <TenantLink to={'/devices/iotController/add'}
                          rbacOpsIds={[getOpsApi(IotUrlsInfo.addIotController)]}>
                          {$t({ defaultMessage: 'Add IoT Controller' })}
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
