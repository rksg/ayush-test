import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  Loader,
  Table,
  TableProps,
  ProgressBar,
  ContentSwitcher,
  ContentSwitcherProps,
  NoData,
  Tooltip
} from '@acx-ui/components'
import { intlFormats, formatter }         from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }  from '@acx-ui/react-router-dom'
import { notAvailableMsg, noDataDisplay } from '@acx-ui/utils'

import { useHealthQuery, HealthData } from './services'
import * as UI                        from './styledComponents'

export const calcPercent = ([val, sum]:(number | null)[]) => {
  const percent = val !== null && sum ? val / sum : null
  return { percent, formatted: formatter('percentFormatRound')(percent) }
}

export function VenuesHealthDashboard ({
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
              to={`/venues/${row.zoneId}/venue-details/analytics/health/overview`}
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
      align: 'center' as const,
      render: (value: unknown)=>{
        return <ProgressBar percent={(value as number) * 100}/>
      }
    },
    {
      title: $t({ defaultMessage: 'Connection Success' }),
      dataIndex: 'connectionSuccessPercent',
      key: 'connectionSuccessPercent',
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const [n,d] = row.connectionSuccessSLA
        const tooltipText=$t({ defaultMessage: '{n} of {d} attempts' }, {
          n: $t(intlFormats.countFormat, { value: n }),
          d: $t(intlFormats.countFormat, { value: d }) })
        return (<Tooltip title={tooltipText}>
          <span data-tooltip={tooltipText}>{value as string}</span>
        </Tooltip>)
      }
    },
    {
      title: $t({ defaultMessage: 'Time To Connect' }),
      dataIndex: 'timeToConnectPercent',
      key: 'timeToConnectPercent',
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const [n,d] = row.timeToConnectSLA
        const threshold = row.timeToConnectThreshold ??
          kpiConfig.timeToConnect.histogram.initialThreshold
        const thresholdText = $t({ defaultMessage: '< {threshold}' },
          { threshold: formatter('durationFormat')(threshold) })
        if(row.timeToConnectThreshold === null) return <span>{noDataDisplay}</span>
        const tooltipText=$t({
          defaultMessage: '{n} of {d} connections under {threshold}' },
        { n: $t(intlFormats.countFormat, { value: n }),
          d: $t(intlFormats.countFormat, { value: d }),
          threshold: formatter('longDurationFormat')(threshold) })
        return (<Tooltip title={tooltipText}>
          <span data-tooltip={tooltipText}>{value as string}</span>
          <UI.ThresholdText>
            {thresholdText}
          </UI.ThresholdText>
        </Tooltip>)
      }
    },
    {
      title: $t({ defaultMessage: 'Client Throughput' }),
      dataIndex: 'clientThroughputPercent',
      key: 'clientThroughputPercent',
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const [n,d] = row.clientThroughputSLA
        const threshold = row.clientThroughputThreshold ??
          kpiConfig.clientThroughput.histogram.initialThreshold
        const thresholdText = $t({ defaultMessage: '> {threshold}' },
          { threshold: formatter('networkSpeedFormat')(threshold) })
        if(row.clientThroughputThreshold === null) return <span>{noDataDisplay}</span>
        const tooltipText = $t({
          defaultMessage: '{n} of {d} sessions above {threshold}' },
        { n: $t(intlFormats.countFormat, { value: n }),
          d: $t(intlFormats.countFormat, { value: d }),
          threshold: formatter('networkSpeedFormat')(threshold) })
        return (<Tooltip title={tooltipText}>
          <span data-tooltip={tooltipText}>{value as string}</span>
          <UI.ThresholdText>
            {thresholdText}
          </UI.ThresholdText>
        </Tooltip>)
      }
    },
    {
      title: $t({ defaultMessage: 'Online APs' }),
      dataIndex: 'onlineApsPercent',
      key: 'onlineApsPercent',
      align: 'center' as const,
      render: (value: unknown, row)=>{
        const [n,d] = row.onlineApsSLA
        const tooltipText=$t({ defaultMessage: '{n} of {d} APs online' }, {
          n: $t(intlFormats.countFormat, { value: n }),
          d: $t(intlFormats.countFormat, { value: d }) })
        return (<Tooltip title={tooltipText}>
          <span data-tooltip={tooltipText}>{value as string}</span>
        </Tooltip>)
      }
    }
  ]

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

  const onArrowClick = useNavigateToPath('/analytics/health/')
  return (
    <Loader states={[queryResults]}>
      <HistoricalCard
        title={$t({ defaultMessage: 'Client Experience' })}
        subTitle={$t({ defaultMessage: 'Top 5 Venues/Services with poor experience' })}
        onArrowClick={onArrowClick}
      >
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              <ContentSwitcher tabDetails={tabDetails} size='small' />
            </div>)}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
