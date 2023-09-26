import { Button }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Loader,
  Card,
  cssStr,
  DonutChartData,
  NoActiveContent
} from '@acx-ui/components'
import { useGetGatewayAlarmsQuery, useGetGatewayDashboardQuery } from '@acx-ui/rc/services'

import * as UI from '../styledComponents'

import NameValueWidget from './NameValueWidget'


export function DashboardStatistics () {

  const { $t } = useIntl()
  const { tenantId, gatewayId } = useParams()
  const { data: alarm, isLoading: isAlarmLoading, isFetching: isAlarmFetching } =
    useGetGatewayAlarmsQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })

  const { data: dashboardData, isLoading: isDashboardLoading, isFetching: isDashboardFetching } =
    useGetGatewayDashboardQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })


  const alarmData: DonutChartData[] = [
    { value: alarm?.total || 0,
      name: 'Total',
      color: cssStr('--acx-accents-orange-30') }
  ]

  const getFixedDecimalNumber = function (num: number) {
    return Number((num).toFixed(2))
  }

  const getMemoryStorageInGb = function (numberInMb: number) {
    return getFixedDecimalNumber(numberInMb / 1000)
  }

  return (
    <Card type='solid-bg'>
      <GridRow style={{ flexGrow: '1', height: '128px' }}>
        <GridCol col={{ span: 1 }} />
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[{ isLoading: isAlarmLoading, isFetching: isAlarmFetching }]}>
              { alarmData && alarmData.length > 0
                ? <UI.DonutChartWidget
                  title={$t({ defaultMessage: 'Alarms' })}
                  style={{ width: 100, height: 100 }}
                  legend={'name-value'}
                  data={alarmData}/>
                : <NoActiveContent text={$t({ defaultMessage: 'No active alarms' })} />
              }
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[{ isLoading: isDashboardLoading, isFetching: isDashboardFetching }]}>
              <NameValueWidget
                name={$t({ defaultMessage: 'CPU' })}
                value={getFixedDecimalNumber(dashboardData?.cpuPercentage?.value || 0)}
                unit='%'/>
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[{ isLoading: isDashboardLoading, isFetching: isDashboardFetching }]}>
              <NameValueWidget
                name={$t({ defaultMessage: 'Memory Usage' })}
                value={getMemoryStorageInGb(dashboardData?.memoryInMb?.value || 0)}
                unit='GB'/>
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[{ isLoading: isDashboardLoading, isFetching: isDashboardFetching }]}>
              <NameValueWidget
                name={$t({ defaultMessage: 'Storage' })}
                value={getFixedDecimalNumber(dashboardData?.storageInGb?.value || 0)}
                unit='GB'/>
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[{ isLoading: isDashboardLoading, isFetching: isDashboardFetching }]}>
              <NameValueWidget
                name={$t({ defaultMessage: 'Temperature' })}
                value={dashboardData?.temperatureInCelsius?.value || 0}
                unit='C'/>
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 3 }}>
          <UI.Wrapper>
            <Button type='link' size='small'>
              {$t({ defaultMessage: 'More Details' })}
            </Button>
          </UI.Wrapper>
        </GridCol>
      </GridRow>
    </Card>
  )
}