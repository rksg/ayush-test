import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table
} from '@acx-ui/components'
import { intlFormats } from '@acx-ui/utils'

import { useHealthQuery, HealthData } from './services'

export default function HealthWidget ({
  filters
}: {
    filters: AnalyticsFilter;
  }) {
  const { $t } = useIntl()
  const queryResults = useHealthQuery(filters)
  const { data } = queryResults
  // eslint-disable-next-line no-console
  console.log('Data:', data)
  const columns=[
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: 100
    },
    {
      title: $t({ defaultMessage: 'Overall Health' }),
      dataIndex: 'overallHealthFormatted',
      key: 'overallHealthFormatted',
      width: 60
    },
    {
      title: $t({ defaultMessage: 'Connection Success' }),
      dataIndex: 'connectionSuccessPercent',
      key: 'connectionSuccessPercent',
      width: 60
    },
    {
      title: $t({ defaultMessage: 'Time To Connect' }),
      dataIndex: 'timeToConnectPercent',
      key: 'timeToConnectPercent',
      width: 60,
      render: (value:unknown,row:HealthData)=>{
        if(value === '-')
          return <span>{value}</span>
        else
          return (<span>
            {`${value as string} - ${Number(row.timeToConnectThreshold)/1000} Secs`}
          </span>)
      }
    },
    {
      title: $t({ defaultMessage: 'Client Throughput' }),
      dataIndex: 'clientThroughputPercent',
      key: 'clientThroughputPercent',
      width: 60,
      render: (value:unknown,row:HealthData)=>{
        if(value === '-')
          return <span>{value}</span>
        else
          return (<span>
            {`${value as string} - ${Number(row.clientThroughputThreshold)/1000} Mbps`}
          </span>)
      }
    }
  ]
  const calcPercent = (values:[number,number]|[null,null]) => {
    if(values[0] && values[1]){
      const percent = values[0]/values[1]
      return {
        formatted: $t(intlFormats.percentFormatRound, { value: percent }),
        percent
      }
    }
    return {
      formatted: '-',
      percent: 0
    }
  }
  const getHealthData = (healthData:HealthData[])=>{
    return healthData.map((row)=>{
      const {
        connectionSuccessSLA,
        timeToConnectSLA,
        clientThroughputSLA
      } = row
      const connectionSuccessPercent=calcPercent(connectionSuccessSLA)
      const timeToConnectPercent= calcPercent(timeToConnectSLA)
      const clientThroughputPercent=calcPercent(clientThroughputSLA)
      let overallHealth = 0
      if(connectionSuccessPercent.percent
        && timeToConnectPercent.percent
        && clientThroughputPercent.percent){
        overallHealth=(connectionSuccessPercent.percent
            + timeToConnectPercent.percent
            + clientThroughputPercent.percent)/3
      }
      return { ...row,
        connectionSuccessPercent: connectionSuccessPercent.formatted,
        timeToConnectPercent: timeToConnectPercent.formatted,
        clientThroughputPercent: clientThroughputPercent.formatted,
        overallHealthFormatted: $t(intlFormats.percentFormatRound, { value: overallHealth }),
        overallHealth
      }
    }).filter(item=>item.overallHealth!==0)
      .sort((a,b)=>a.overallHealth - b.overallHealth)
      .slice(0,5)
  }
  return (
    <Loader states={[queryResults]}>
      <Card
        title={$t({ defaultMessage: 'Health' })}
        subTitle={$t({ defaultMessage: 'Top 5 Venues with poor experience' })}
      >
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              {data && <Table
                columns={columns}
                dataSource={getHealthData(data.health)}
                pagination={false}
                type={'compact'}
                rowKey='zoneName'
              />}
            </div>)}
        </AutoSizer>
      </Card>
    </Loader>
  )
}