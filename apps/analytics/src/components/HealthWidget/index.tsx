import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { Tooltip }                    from '@acx-ui/components'
import {
  Card,
  Loader,
  Table,
  TableProps,
  ProgressBar,
  ContentSwitcher,
  ContentSwitcherProps,
  NoData
} from '@acx-ui/components'
import { TenantLink }                 from '@acx-ui/react-router-dom'
import { formatter, notAvailableMsg } from '@acx-ui/utils'

import { useHealthQuery, HealthData } from './services'
import * as UI                        from './styledComponents'

export default function HealthWidget ({
  filters
}: {
    filters: AnalyticsFilter;
  }) {
  const { $t } = useIntl()
  const queryResults = useHealthQuery(filters)
  const { data } = queryResults
  const columns: TableProps<HealthData>['columns'] = [
    {
      dataIndex: 'zoneName',
      key: 'zoneName',
      render: function (text: unknown, row) {
        return (
          <UI.VenueName>
            <TenantLink
              to={`/venues/${row.zoneId}/venue-details/overview`}
              title={text as string}>
              {text as string}
            </TenantLink>
          </UI.VenueName>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Score' }),
      dataIndex: 'clientExperience',
      key: 'clientExperience',
      width: 40,
      align: 'center' as const,
      render: (value: unknown)=>{
        return <ProgressBar percent={(value as number) * 100}/>
      }
    },
    {
      title: $t({ defaultMessage: 'Connection Success' }),
      dataIndex: 'connectionSuccessPercent',
      key: 'connectionSuccessPercent',
      width: 40,
      align: 'center' as const
    },
    {
      title: $t({ defaultMessage: 'Time To Connect' }),
      dataIndex: 'timeToConnectPercent',
      key: 'timeToConnectPercent',
      width: 80,
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const threshold = row.timeToConnectThreshold ??
          kpiConfig.timeToConnect.histogram.initialThreshold
        const thresholdText = $t({ defaultMessage: 'Under {threshold}' },
          { threshold: formatter('durationFormat')(threshold) })
        if(value === '-') return <span>{value}</span>
        return (<>
          <span>{value as string}</span>
          <UI.ThresholdText>
            {thresholdText}
          </UI.ThresholdText>
        </>)
      }
    },
    {
      title: $t({ defaultMessage: 'Client Throughput' }),
      dataIndex: 'clientThroughputPercent',
      key: 'clientThroughputPercent',
      width: 90,
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const threshold = row.clientThroughputThreshold ??
          kpiConfig.clientThroughput.histogram.initialThreshold
        const thresholdText = $t({ defaultMessage: 'Above {threshold}' },
          { threshold: formatter('networkSpeedFormat')(threshold) })
        if(value === '-') return <span>{value}</span>
        return (<>
          <span>{value as string}</span>
          <UI.ThresholdText>
            {thresholdText}
          </UI.ThresholdText>
        </>)
      }
    },
    {
      title: $t({ defaultMessage: 'Online APs' }),
      dataIndex: 'onlineApsPercent',
      key: 'onlineApsPercent',
      align: 'center' as const,
      width: 40
    }
  ]
  const calcPercent = ([val, sum]:(number | null)[]) => {
    const percent = val && sum ? val / sum : null
    return { percent, formatted: formatter('percentFormatRound')(percent) }
  }

  const calculateClientExp = (slas:(number|null)[]) => {
    const arr = slas.filter(sla => sla !== null)
    return arr.length ? mean(arr) : null
  }

  const getHealthData = (healthData:HealthData[])=>{
    return healthData.map((row)=>{
      const {
        connectionSuccessSLA,
        timeToConnectSLA,
        clientThroughputSLA,
        onlineApsSLA
      } = row
      const connectionSuccessPercent = calcPercent(connectionSuccessSLA)
      const timeToConnectPercent = calcPercent(timeToConnectSLA)
      const clientThroughputPercent = calcPercent(clientThroughputSLA)
      const onlineApsPercent = calcPercent(onlineApsSLA)
      const clientExperience = calculateClientExp([
        connectionSuccessPercent.percent,
        timeToConnectPercent.percent,
        clientThroughputPercent.percent
      ])
      return { ...row,
        connectionSuccessPercent: connectionSuccessPercent.formatted,
        timeToConnectPercent: timeToConnectPercent.formatted,
        clientThroughputPercent: clientThroughputPercent.formatted,
        onlineApsPercent: onlineApsPercent.formatted,
        clientExperience
      }
    }).filter(item=>item.clientExperience!==null)
      .sort((a,b)=>(a.clientExperience as number) - (b.clientExperience as number))
      .slice(0,5)
  }

  const healthData = data && data.health.length ? getHealthData(data.health) : null

  const clientExpTab = healthData && healthData.length
    ? <UI.Wrapper>
      <Table
        columns={columns}
        dataSource={healthData}
        pagination={false}
        type={'compactBordered'}
        rowKey='zoneName'
      />
    </UI.Wrapper>
    : <NoData/>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    {
      label: $t({ defaultMessage: 'Venue' }),
      children: clientExpTab,
      value: 'clientExp'
    },
    {
      label: <Tooltip title={$t(notAvailableMsg)}>
        {$t({ defaultMessage: 'Service' })}
      </Tooltip>,
      children: <>
        {$t({ defaultMessage: 'Coming Soon' })}
      </>,
      value: 'services',
      disabled: true
    }
  ]
  return (
    <Loader states={[queryResults]}>
      <Card
        title={$t({ defaultMessage: 'Client Experience' })}
        subTitle={$t({ defaultMessage: 'Top 5 Venues/Services with poor experience' })}
      >
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              <ContentSwitcher tabDetails={tabDetails} size='small' space={8} />
            </div>)}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
