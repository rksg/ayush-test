import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  Table,
  TableProps,
  NoData } from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { TenantLink }                       from '@acx-ui/react-router-dom'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import { useTopSwitchesByErrorQuery, TopSwitchesByErrorData } from './services'
import { CustomTable }                                        from './styledComponents'

export { TopSwitchesByErrorWidget as TopSwitchesByError }

function TopSwitchesByErrorWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopSwitchesByErrorQuery(filters)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const columns: TableProps<TopSwitchesByErrorData>['columns']=[
    {
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'name',
      key: 'name',
      render: (_, { name, mac, serial }) => <TenantLink
        to={`/devices/switch/${mac?.toLowerCase()}/${serial}/details/overview`}>
        { name }
      </TenantLink>
    },
    {
      title: $t({ defaultMessage: 'Switch Id' }),
      dataIndex: 'mac',
      key: 'mac'
    },
    {
      title: $t({ defaultMessage: 'Total Errors' }),
      dataIndex: 'totalErr',
      key: 'inErr',
      align: 'right' as const
    },
    {
      title: $t({ defaultMessage: 'In Errors' }),
      dataIndex: 'inErr',
      key: 'inErr',
      align: 'right' as const
    },
    {
      title: $t({ defaultMessage: 'Out Errors' }),
      dataIndex: 'outErr',
      key: 'outErr',
      align: 'right' as const
    }
  ]

  const getDataSource= (topSwitchesByErrorData: TopSwitchesByErrorData[]) => {
    return topSwitchesByErrorData.map((item) => {
      return {
        ...item,
        totalErr: item.inErr+item.outErr
      }
    })
  }

  const { data } = queryResults

  const topSwitchesByErrorTable =
  data && data.topNSwitchesByErrors && data.topNSwitchesByErrors.length ? <CustomTable>
    <Table
      columns={columns}
      dataSource={getDataSource(data.topNSwitchesByErrors)}
      type='compact'
      rowKey='mac'
    />
  </CustomTable> : <NoData/>

  useTrackLoadTime({
    itemName: widgetsMapping.TOP_SWITCHES_BY_ERROR,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Top Switches by Error' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              {topSwitchesByErrorTable}
            </div>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
