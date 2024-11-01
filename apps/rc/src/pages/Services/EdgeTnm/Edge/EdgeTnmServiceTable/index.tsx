import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { ToolTipTableStyle }                                                      from '@acx-ui/rc/components'
import { useDeleteEdgeTnmServiceMutation, useGetEdgeTnmServiceViewDataListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  getServiceListRoutePath,
  getServiceRoutePath,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  useTableQuery,
  EdgeTnmServiceViewData
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

const settingsId = 'services-edge-tnm-service-table'
export function EdgeTnmServiceTable () {
  const { $t } = useIntl()
  const [ deleteFn, { isLoading: isDeleting } ] = useDeleteEdgeTnmServiceMutation()

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeTnmServiceViewDataListQuery,
    defaultPayload: {
      fields: ['id', 'name', 'version', 'status'],
      filters: {}
    },
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const rowActions: TableProps<EdgeTnmServiceViewData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge Tnm Service' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({ params: { serviceId: row.id } }).unwrap()))
              .then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.DELETE)
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'Thirdparty Network Management ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.CREATE)}
            // eslint-disable-next-line max-len
            to={getServiceRoutePath({ type: ServiceType.EDGE_TNM_SERVICE, oper: ServiceOperation.CREATE })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add mDNS Proxy Service' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery, { isLoading: false, isFetching: isDeleting }]}>
        <ToolTipTableStyle.ToolTipStyle/>
        <Table
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          rowActions={allowedRowActions}
          rowSelection={(allowedRowActions.length > 0) && { type: 'checkbox' }}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          pagination={tableQuery.pagination}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<EdgeTnmServiceViewData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_TNM_SERVICE,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    }
  ]

  return columns
}