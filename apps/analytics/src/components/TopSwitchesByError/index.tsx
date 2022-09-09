import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  Loader,
  Table,
  NoData } from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { useTopSwitchesByErrorQuery, TopSwitchesByErrorData } from './services'
import { CustomTable }                                        from './styledComponents'

export default function TopSwitchesByErrorWidget ({
  filters
}: {
  filters: AnalyticsFilter;
}) {
  const { $t } = useIntl()
  const queryResults = useTopSwitchesByErrorQuery(filters
  )
  const basePath = useTenantLink('/switches/')
  const navigate = useNavigate()
  const onClick = (param: string) => {
    navigate({
      ...basePath,
      // TODO Actual path to be updated later
      pathname: `${basePath.pathname}/${param}`
    })
  }

  const columns=[
    {
      title: 'Switch',
      dataIndex: 'name',
      key: 'name',
      render: (name:unknown) => {
        return <span onClick={() => onClick('TBD')} 
          className='test-span-click' >{name as string}</span>}
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
  data && data.topNSwitchesByErrors && data.topNSwitchesByErrors.length ? <CustomTable><Table
    columns={columns}
    dataSource={getDataSource(data.topNSwitchesByErrors)}
    type={'compact'}
    pagination={false} /></CustomTable> : <NoData/>

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