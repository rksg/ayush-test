import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }       from '@acx-ui/components'
import {
  useGetClientIsolationUsageByVenueQuery
} from '@acx-ui/rc/services'
import {
  ClientIsolationListUsageByVenue,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType,
  useTableQuery
}   from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


export default function ClientIsolationAllowList () {
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetClientIsolationUsageByVenueQuery,
    defaultPayload: {}
  })

  const columns: TableProps<ClientIsolationListUsageByVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Policy Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (data, row) => {
        return <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.CLIENT_ISOLATION,
          oper: PolicyOperation.DETAIL,
          policyId: row.id
        })}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Client' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      key: 'networkCount',
      align: 'center'
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<ClientIsolationListUsageByVenue>
        columns={columns}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}
