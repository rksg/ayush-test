import { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  IncidentBySeverityDonutChart
} from '@acx-ui/analytics/components'
import { AnalyticsFilter }                                                     from '@acx-ui/analytics/utils'
import { cssStr, Loader, Card, DonutChart, GridRow, GridCol, NoActiveContent } from '@acx-ui/components'
import type { DonutChartData }                                                 from '@acx-ui/components'
import { Client, PoeUsage }                                                    from '@acx-ui/icons'
import {  useAlarmsListQuery }                                                 from '@acx-ui/rc/services'
import {
  Alarm,
  EventSeverityEnum,
  getPoeUsage,
  SwitchViewModel
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'

import * as UI                 from './styledComponents'
import { SwitchDetailsDrawer } from './SwitchDetailsDrawer'

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

export function SwitchInfoWidget (props:{
  switchDetail: SwitchViewModel, filters: AnalyticsFilter }) {
  const params = useParams()
  const { $t } = useIntl()
  const { switchDetail, filters } = props
  const [visible, setVisible] = useState(false)

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
      page: 1,
      total: 0
    }
  })

  const alarmData = getChartData(alarmQuery.data?.data!)

  const onMoreAction = () => {
    setVisible(true)
  }

  const PortsDonutWidget = () => {
    const { $t } = useIntl()
    const chartData = [
      { key: 'disconnected',
        name: 'Disconnected Ports',
        value: switchDetail?.portsStatus?.Down || 0,
        color: cssStr('--acx-neutrals-50') },
      { key: 'connected',
        name: 'Connected Ports',
        value: switchDetail?.portsStatus?.Up || 0,
        color: cssStr('--acx-semantics-green-50') }
    ]
    const data = !chartData[0].value && !chartData[1].value ? [] : chartData
    return (
      <DonutChart
        title={$t({ defaultMessage: 'Ports' })}
        style={{ width: 100, height: 100 }}
        data={data}
      />
    )
  }
  const poeUsage = getPoeUsage(switchDetail)

  return (
    <UI.Container>
      <Card title={switchDetail?.model}
        type='solid-bg'
        action={{
          actionName: $t({ defaultMessage: 'More Details' }),
          onActionClick: onMoreAction
        }}
      >
        <GridRow style={{ flexGrow: '1' }}>
          <GridCol col={{ span: 1 }} />
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
          <GridCol col={{ span: 4 }}>
            <UI.Wrapper>
              <PortsDonutWidget />
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 5 }}>
            <GridRow>
              <GridCol col={{ span: 24 }} >
                <UI.Wrapper>
                  <Client />
                </UI.Wrapper>
                <UI.Wrapper>
                  <UI.ChartTopTitle>
                    {$t({ defaultMessage: '{clients, plural, one {Client} other {Clients}}' },
                      { clients: switchDetail?.clientCount }
                    )}
                  </UI.ChartTopTitle>
                </UI.Wrapper>
                <UI.Wrapper style={{ marginTop: '5px' }}>
                  <UI.LargeText>
                    {switchDetail?.clientCount || 0}
                  </UI.LargeText>
                </UI.Wrapper>
              </GridCol>
            </GridRow>
          </GridCol>
          <GridCol col={{ span: 5 }}>
            <GridRow>
              <GridCol col={{ span: 24 }} >
                <UI.Wrapper>
                  <PoeUsage />
                </UI.Wrapper>
                <UI.Wrapper>
                  <UI.ChartTopTitle>
                    {$t({ defaultMessage: 'PoE Usage' })}
                  </UI.ChartTopTitle>
                </UI.Wrapper>
                <UI.Wrapper style={{ marginTop: '5px' }}>
                  <UI.LargeText>
                    {poeUsage?.used}w/{poeUsage?.total}w
                    <Typography.Title level={3}>
                    ({poeUsage?.percentage})
                    </Typography.Title>
                  </UI.LargeText>
                </UI.Wrapper>
              </GridCol>
            </GridRow>
          </GridCol>
        </GridRow>
      </Card>
      {visible && <SwitchDetailsDrawer
        visible={visible}
        onClose={()=>setVisible(false)}
        switchDetail={switchDetail}
      /> }
    </UI.Container>
  )
}
