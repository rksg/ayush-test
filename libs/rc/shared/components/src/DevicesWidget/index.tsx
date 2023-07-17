import { Space }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, DonutChart,
  getDeviceConnectionStatusColorsv2,
  GridCol, GridRow, StackedBarChart }    from '@acx-ui/components'
import type { DonutChartData }           from '@acx-ui/components'
import { Features, useIsTierAllowed }    from '@acx-ui/feature-toggle'
import { ChartData }                     from '@acx-ui/rc/utils'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'
import { filterByAccess }                from '@acx-ui/user'

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

  const edgeSupported = useIsTierAllowed(Features.EDGES)

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
  edgeStackedData: ChartData[],
  apTotalCount: number,
  switchTotalCount: number,
  edgeTotalCount: number,
  enableArrowClick?: boolean
}) {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/devices/')
  const edgeSupported = useIsTierAllowed(Features.EDGES)

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
                    <TenantLink to={'/devices/wifi'}>
                      {apTotalCount}
                    </TenantLink>
                  </Space>
                  : <UI.LinkContainer style={{ height: height/2 - 30 }}>
                    {filterByAccess([<TenantLink to={'/devices/wifi/add'}>
                      {$t({ defaultMessage: 'Add Access Point' })}
                    </TenantLink>])}
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
                    <TenantLink to={'/devices/switch'}>
                      {switchTotalCount}
                    </TenantLink>
                  </Space>
                  : <UI.LinkContainer style={{ height: (height/2) - 30 }}>
                    {filterByAccess([<TenantLink to={'/devices/switch/add'}>
                      {$t({ defaultMessage: 'Add Switch' })}
                    </TenantLink>])}
                  </UI.LinkContainer>
                }
              </GridCol>
            </GridRow>
            { edgeSupported &&
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
                      <TenantLink to={'/devices/edge'}>
                        {edgeTotalCount}
                      </TenantLink>
                    </Space>
                    : <UI.LinkContainer style={{ height: (height/2) - 30 }}>
                      {filterByAccess([<TenantLink to={'/devices/edge/add'}>
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
