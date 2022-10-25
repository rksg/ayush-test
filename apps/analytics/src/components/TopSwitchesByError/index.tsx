import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData } from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import { useTopSwitchesByErrorQuery, TopSwitchesByErrorData } from './services'
import { CustomTable }                                        from './styledComponents'

export default function TopSwitchesByErrorWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopSwitchesByErrorQuery(filters)

  const columns=[
    {
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'name',
      key: 'name',
      render: (name: unknown) => {
        // TODO Actual path to be updated later
        return (
          <TenantLink to={'/switches/TBD'}>
            { name as string }
          </TenantLink>
        )
      }
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
      pagination={false}
      rowKey='mac'
    />
  </CustomTable> : <NoData/>

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switches by Error' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              {topSwitchesByErrorTable}
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
