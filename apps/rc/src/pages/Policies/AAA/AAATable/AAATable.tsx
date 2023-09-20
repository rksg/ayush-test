import { useIntl } from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteAAAPolicyListMutation,
  useGetAAAPolicyViewModelListQuery,
  useNetworkListQuery
} from '@acx-ui/rc/services'
import {
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  PolicyOperation,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  AAAViewModalType,
  AAAPurposeEnum,
  AAA_LIMIT_NUMBER
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }                                          from '@acx-ui/user'

export default function AAATable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { tenantId } = useParams()
  const tenantBasePath: Path = useTenantLink('')
  const [ deleteFn ] = useDeleteAAAPolicyListMutation()
  const tableQuery = useTableQuery({
    useQuery: useGetAAAPolicyViewModelListQuery,
    defaultPayload: {
      filters: {}
    },
    search: {
      searchString: '',
      searchTargetFields: ['name']
    }
  })

  const doDelete = (selectedRows: AAAViewModalType[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Policy' }),
      selectedRows[0].name,
      [{ fieldName: 'networkIds', fieldText: $t({ defaultMessage: 'Network' }) }],
      async () => deleteFn({
        params: { tenantId },
        payload: selectedRows.map(row => row.id)
      }).then(callback)
    )
  }

  const rowActions: TableProps<AAAViewModalType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => doDelete(selectedRows, clearSelection)
    },
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows: AAAViewModalType[]) => selectedRows?.length === 1,
      onClick: ([{ id }]) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.AAA,
            oper: PolicyOperation.EDIT,
            policyId: id!
          })
        })
      }
    }
  ]
  return (
    <>
      <PageHeader
        title={
          $t({
            defaultMessage: 'RADIUS Server ({count})'
          },
          {
            count: tableQuery.data?.totalCount
          })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}>
            <Button type='primary'
              disabled={tableQuery.data?.totalCount
                ? tableQuery.data?.totalCount >= AAA_LIMIT_NUMBER
                : false} >{$t({ defaultMessage: 'Add RADIUS Server' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<AAAViewModalType>
          settingsId='policies-aaa-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'checkbox' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const params = useParams()
  const emptyNetworks: { key: string, value: string }[] = []
  const { networkNameMap } = useNetworkListQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 2048
    }
  }, {
    selectFromResult: ({ data }) => ({
      networkNameMap: data?.data
        ? data.data.map(network => ({ key: network.id, value: network.name }))
        : emptyNetworks
    })
  })
  const columns: TableProps<AAAViewModalType>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.AAA,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'RADIUS Type' }),
      dataIndex: 'type',
      sorter: true,
      render: (_, { type }) =>{
        return type ? AAAPurposeEnum[type] : ''
      }
    },
    {
      key: 'primary',
      title: $t({ defaultMessage: 'Primary Server' }),
      dataIndex: 'primary',
      sorter: true
    },
    {
      key: 'secondary',
      title: $t({ defaultMessage: 'Secondary Server' }),
      dataIndex: 'secondary',
      sorter: true
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      filterKey: 'networkIds',
      filterable: networkNameMap,
      sorter: true,
      render: (_, row) =>{
        if (!row.networkIds || row.networkIds.length === 0) return 0
        const networkIds = row.networkIds
        // eslint-disable-next-line max-len
        const tooltipItems = networkNameMap.filter(v => networkIds!.includes(v.key)).map(v => v.value)
        return <SimpleListTooltip items={tooltipItems} displayText={networkIds.length} />
      }
    }
  ]

  return columns
}
