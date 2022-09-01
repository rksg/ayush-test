import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'


import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData } from '@acx-ui/components'

import { useSwitchesByErrorsQuery, SwitchesByErrorsData } from './services'


export default function SwitchesByErrorsWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useSwitchesByErrorsQuery(filters
  )

  const columns=[
    {
      title: 'Switch',
      dataIndex: 'name',
      key: 'name',
      render: (name:unknown) => {
        return <a href='/#TBD'>{name as string}</a>}
    },
    {
      title: 'Switch Id',
      dataIndex: 'mac',
      key: 'mac'
    },
    {
      title: 'Total Errors',
      dataIndex: 'totalErr',
      key: 'inErr',
      align: 'right' as const
    },
    {
      title: 'In Errors',
      dataIndex: 'inErr',
      key: 'inErr',
      align: 'right' as const
    },
    {
      title: 'Out Errors',
      dataIndex: 'outErr',
      key: 'outErr',
      align: 'right' as const
    }
  ]

  const getDataSource= (switchesByErrorsData: SwitchesByErrorsData[]) => {
    return switchesByErrorsData.map((item) => {
      return {
        ...item,
        totalErr: item.inErr+item.outErr
      }
    })
  }

  const { data } = queryResults

  const switchesByErrorsTable = 
  data && data.topNSwitchesByErrors && data.topNSwitchesByErrors.length ? <Table
    columns={columns}
    dataSource={getDataSource(data.topNSwitchesByErrors)}
    type={'compact'}
    pagination={false}
  /> : <NoData/>

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Top 5 Switches by Error' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width }}>
              {switchesByErrorsTable}
            </div>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}