import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  IncidentBySeverityDonutChart, KpiWidget, TtcTimeWidget
} from '@acx-ui/analytics/components'
import { healthApi }                                               from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }                              from '@acx-ui/analytics/utils'
import { cssStr, Loader, Card, GridRow, GridCol, NoActiveContent } from '@acx-ui/components'
import type { DonutChartData }                                     from '@acx-ui/components'
import {  useAlarmsListQuery }                                     from '@acx-ui/rc/services'
import {
  Alarm,
  ApViewModel,
  EventSeverityEnum
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { WrapIfAccessible }              from '@acx-ui/user'

import { AlarmsDrawer } from '../AlarmsDrawer'

import * as UI from './styledComponents'

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType',
    'switchMacAddress'
  ]
}

type ReduceReturnType = Record<string, number>

export const getChartData = (alarms: Alarm[]): DonutChartData[] => {
  const seriesMapping = [
    { key: EventSeverityEnum.CRITICAL,
      name: 'Critical',
      color: cssStr('--acx-semantics-red-50') },
    { key: EventSeverityEnum.MAJOR,
      name: 'Major',
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>
  const chartData: DonutChartData[] = []

  if (alarms && alarms.length > 0) {
    const alarmsSummary = alarms.reduce<ReduceReturnType>((acc, { severity }) => {
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {})

    seriesMapping.forEach(({ key, name, color }) => {
      if (alarmsSummary[key]) {
        chartData.push({
          name,
          value: alarmsSummary[key],
          color
        })
      }
    })
  }
  return chartData
}

export function ApInfoWidget (props:{ currentAP: ApViewModel, filters: AnalyticsFilter }) {
  const { $t } = useIntl()
  const { apId } = useParams()
  const { currentAP, filters } = props
  const [alarmDrawerVisible, setAlarmDrawerVisible] = useState(false)

  // Alarms list query
  const alarmQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        serialNumber: [currentAP.serialNumber]
      }
    },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 10000,
      page: 1,
      total: 0
    }
  })

  const alarmData = getChartData(alarmQuery.data?.data!)

  const { data: healthData }= healthApi.useGetKpiThresholdsQuery({ ...filters,
    kpis: ['timeToConnect','clientThroughput'] })

  return (
    <Card title={currentAP?.model} type='solid-bg'>
      <GridRow style={{ flexGrow: '1' }}>
        <GridCol col={{ span: 1 }} />
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[alarmQuery]}>
              { alarmData && alarmData.length > 0
                ? <div onClick={() => setAlarmDrawerVisible(true)}>
                  <UI.DonutChartWidget
                    title={$t({ defaultMessage: 'Alarms' })}
                    style={{ width: 100, height: 100 }}
                    legend={'name-value'}
                    data={alarmData}/>
                </div>
                : <NoActiveContent text={$t({ defaultMessage: 'No active alarms' })} />
              }
            </Loader>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <WrapIfAccessible wrapper={children =>
              <UI.TenantLinkSvg
                to={`/devices/wifi/${apId}/details/analytics`}
                children={children}
              />
            }>
              <IncidentBySeverityDonutChart type='no-card-style' filters={filters}/>
            </WrapIfAccessible>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <UI.Wrapper>
            <WrapIfAccessible wrapper={children =>
              <UI.TenantLinkBlack
                to={`/devices/wifi/${apId}/details/analytics/health/overview`}
                children={children}
              />
            }>
              <KpiWidget type='no-chart-style' filters={filters} name='connectionSuccess' />
            </WrapIfAccessible>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <UI.Wrapper>
            <WrapIfAccessible wrapper={children =>
              <UI.TenantLinkBlack
                to={`/devices/wifi/${apId}/details/analytics/health/overview`}
                children={children}
              />
            }>
              <TtcTimeWidget filters={filters}/>
            </WrapIfAccessible>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <UI.Wrapper>
            <WrapIfAccessible wrapper={children =>
              <UI.TenantLinkBlack
                to={`/devices/wifi/${apId}/details/analytics/health/overview`}
                children={children}
              />
            }>
              <KpiWidget
                type='no-chart-style'
                filters={filters}
                name='clientThroughput'
                threshold={healthData?.clientThroughputThreshold?.value ??
                  kpiConfig.clientThroughput.histogram.initialThreshold}
              />
            </WrapIfAccessible>
          </UI.Wrapper>
        </GridCol>
      </GridRow>
      <AlarmsDrawer
        visible={alarmDrawerVisible}
        setVisible={setAlarmDrawerVisible}
        serialNumber={apId}
      />
    </Card>
  )
}
