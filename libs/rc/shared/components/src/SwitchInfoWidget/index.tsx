import { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  IncidentBySeverityDonutChart
} from '@acx-ui/analytics/components'
import { cssStr, Loader, Card, GridRow, GridCol, NoActiveContent } from '@acx-ui/components'
import type { DonutChartData }                                     from '@acx-ui/components'
import { useAlarmsListQuery }                                      from '@acx-ui/rc/services'
import {
  Alarm,
  EventSeverityEnum,
  getPoeUsage,
  SwitchViewModel
} from '@acx-ui/rc/utils'
import { CommonUrlsInfo, SwitchStatusEnum, useTableQuery } from '@acx-ui/rc/utils'
import { useParams, TenantLink }                           from '@acx-ui/react-router-dom'
import type { AnalyticsFilter }                            from '@acx-ui/utils'

import { AlarmsDrawer } from '../AlarmsDrawer'

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
  const [alarmDrawerVisible, setAlarmDrawerVisible] = useState(false)

  const isDisconnected
    = switchDetail?.deviceStatus === SwitchStatusEnum.DISCONNECTED

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
      pageSize: 10000,
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
      <UI.DonutChartWidget
        title={$t({ defaultMessage: 'Ports' })}
        style={{ width: 100, height: 100 }}
        data={isDisconnected ? [] : data}
        value={isDisconnected
          ? $t({ defaultMessage: 'Switch {br} disconnected' }, { br: '\n' }) : ''}
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
                  ?<div onClick={() => setAlarmDrawerVisible(true)}>
                    <UI.DonutChartWidget
                      title={$t({ defaultMessage: 'Alarms' })}
                      style={{ width: 100, height: 100 }}
                      legend={'name-value'}
                      data={alarmData}/>
                  </div>
                  : <NoActiveContent
                    text={$t({ defaultMessage: 'No active alarms' })}
                  />
                }
              </Loader>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 4 }}>
            <UI.Wrapper>
              <UI.TenantLinkSvg
                to={`/devices/switch/${params.switchId}/${params.serialNumber}/details/incidents`}
              >
                <IncidentBySeverityDonutChart type='no-card-style' filters={filters}/>
              </UI.TenantLinkSvg>
            </UI.Wrapper>
          </GridCol>
          <GridCol col={{ span: 4 }}>
            <TenantLink
              // eslint-disable-next-line max-len
              to={`/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/ports`}
            >
              <UI.Wrapper>
                <PortsDonutWidget />
              </UI.Wrapper>
            </TenantLink>
          </GridCol>
          <GridCol col={{ span: 5 }} style={{ justifyContent: 'center' }}>
            <GridRow>
              <GridCol col={{ span: 24 }} >
                <UI.Wrapper style={{ minHeight: '31px' }}>
                  <UI.ClientIcon className={isDisconnected ? 'disconnected' : ''}/>
                </UI.Wrapper>
                <UI.Wrapper>
                  <UI.ChartTopTitle className={isDisconnected ? 'disconnected' : ''}>
                    {$t({ defaultMessage: '{clients, plural, one {Client} other {Clients}}' },
                      { clients: switchDetail?.clientCount }
                    )}
                  </UI.ChartTopTitle>
                </UI.Wrapper>
                <UI.Wrapper style={{ marginTop: '6px' }}>
                  {isDisconnected
                    ? <UI.DisconnectedText>{
                      $t({ defaultMessage: 'Switch disconnected' })
                    }</UI.DisconnectedText>
                    : <UI.TenantLinkBlack
                    // eslint-disable-next-line max-len
                      to={`/devices/switch/${params.switchId}/${params.serialNumber}/details/clients`}
                    >
                      <UI.LargeText>
                        {switchDetail?.clientCount || 0}
                      </UI.LargeText>
                    </UI.TenantLinkBlack>}
                </UI.Wrapper>
              </GridCol>
            </GridRow>
          </GridCol>
          <GridCol col={{ span: 5 }} style={{ justifyContent: 'center' }}>
            <GridRow>
              <GridCol col={{ span: 24 }} >
                <UI.Wrapper style={{ minHeight: '31px' }}>
                  <UI.PoeUsageIcon className={isDisconnected ? 'disconnected' : ''} />
                </UI.Wrapper>
                <UI.Wrapper>
                  <UI.ChartTopTitle className={isDisconnected ? 'disconnected' : ''}>
                    {$t({ defaultMessage: 'PoE Usage' })}
                  </UI.ChartTopTitle>
                </UI.Wrapper>
                <UI.Wrapper style={{ marginTop: '6px' }}>
                  {isDisconnected
                    ? <UI.DisconnectedText>{
                      $t({ defaultMessage: 'Switch disconnected' })
                    }</UI.DisconnectedText>
                    : <UI.LargeText>
                      {poeUsage?.used}W/{poeUsage?.total}W
                      <Typography.Title level={3}>{
                        poeUsage?.percentage
                      }</Typography.Title>
                    </UI.LargeText>}
                </UI.Wrapper>
              </GridCol>
            </GridRow>
          </GridCol>
        </GridRow>
      </Card>
      <SwitchDetailsDrawer
        visible={visible}
        onClose={()=>setVisible(false)}
        switchDetail={switchDetail}
      />
      <AlarmsDrawer
        visible={alarmDrawerVisible}
        setVisible={setAlarmDrawerVisible}
        serialNumber={params.serialNumber}
      />
    </UI.Container>
  )
}
