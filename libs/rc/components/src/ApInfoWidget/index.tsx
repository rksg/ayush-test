import { useIntl } from 'react-intl'

import {
  IncidentBySeverityDonutChart, KpiWidget, TtcTimeWidget
} from '@acx-ui/analytics/components'
import { healthApi }                                                           from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }                                          from '@acx-ui/analytics/utils'
import { cssStr, Loader, Card, DonutChart, GridRow, GridCol, NoActiveContent } from '@acx-ui/components'
import type { DonutChartData }                                                 from '@acx-ui/components'
import {  useAlarmsListQuery }                                                 from '@acx-ui/rc/services'
import {
  Alarm,
  ApViewModel,
  EventSeverityEnum
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

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

const seriesMapping = [
  { key: EventSeverityEnum.CRITICAL,
    name: 'Critical',
    color: cssStr('--acx-semantics-red-50') },
  { key: EventSeverityEnum.MAJOR,
    name: 'Major',
    color: cssStr('--acx-accents-orange-30') }
] as Array<{ key: string, name: string, color: string }>

type ReduceReturnType = Record<string, number>

export const getChartData = (alarms: Alarm[]): DonutChartData[] => {
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
  const params = useParams()
  const { $t } = useIntl()
  const { currentAP, filters } = props

  // Alarms list query
  const alarmQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: {
        serialNumber: [params.serialNumber]
      }
    },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25,
      current: 1,
      total: 0
    }
  })

  const alarmData = getChartData(alarmQuery.data?.data!)

  const { data: healthData }= healthApi.useGetKpiThresholdsQuery({ ...filters,
    kpis: ['timeToConnect','clientThroughput'] })

  return (
    <Card title={currentAP?.model} type='solid-bg'>
      <GridRow style={{ flexGrow: '1' }}>
        <GridCol col={{ span: 2 }} />
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <Loader states={[alarmQuery]}>
              { alarmData && alarmData.length > 0
                ? <DonutChart
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
            <IncidentBySeverityDonutChart type='no-card-style' filters={filters}/>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <UI.Wrapper>
            <KpiWidget filters={filters} name='connectionSuccess' type='no-chart-style'/>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <UI.Wrapper>
            <TtcTimeWidget filters={filters}/>
          </UI.Wrapper>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <UI.Wrapper>
            <KpiWidget filters={filters}
              type='no-chart-style'
              name='clientThroughput'
              threshold={healthData?.clientThroughputThreshold?.value ??
                kpiConfig.clientThroughput.histogram.initialThreshold}
            />
          </UI.Wrapper>
        </GridCol>
      </GridRow>
    </Card>
  )
}
