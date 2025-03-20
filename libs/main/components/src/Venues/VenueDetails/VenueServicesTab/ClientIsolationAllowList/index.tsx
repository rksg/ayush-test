import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }       from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
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
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const settingsId = 'venue-client-isolation-allow-list-table'
  const tableQuery = useTableQuery({
    useQuery: useGetClientIsolationUsageByVenueQuery,
    defaultPayload: {},
    pagination: { settingsId },
    enableRbac
  })

  const columns: TableProps<ClientIsolationListUsageByVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Policy Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={getPolicyDetailsLink({
          type: PolicyType.CLIENT_ISOLATION,
          oper: PolicyOperation.DETAIL,
          policyId: row.id
        })}>{row.name}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: $t({ defaultMessage: 'Client' }),
      dataIndex: 'clientCount',
      key: 'clientCount',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Active On' }),
      dataIndex: 'networkCount',
      key: 'networkCount',
      align: 'center'
    }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table<ClientIsolationListUsageByVenue>
        settingsId={settingsId}
        columns={columns}
        pagination={tableQuery.pagination}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}
