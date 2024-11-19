import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                             from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteSoftGreMutation,
  useGetSoftGreViewDataListQuery,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  SoftGreViewData,
  getPolicyDetailsLink,
  MtuTypeEnum,
  useTableQuery,
  getScopeKeyByPolicy,
  filterByAccessForServicePolicyMutation
} from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'description',
    'primaryGatewayAddress',
    'secondaryGatewayAddress',
    'mtuType',
    'mtuSize',
    'keepAliveInterval',
    'keepAliveRetryTimes',
    'disassociateClientEnabled',
    'activations'
  ],
  filters: {}
}

export default function SoftGreTable () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  const settingsId = 'policies-softgre-table'
  const [ deleteSoftGreFn ] = useDeleteSoftGreMutation()

  const tableQuery = useTableQuery<SoftGreViewData>({
    useQuery: useGetSoftGreViewDataListQuery,
    defaultPayload,
    search: {
      searchString: '',
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })


  const rowActions: TableProps<SoftGreViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SOFTGRE, PolicyOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.SOFTGRE,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.SOFTGRE, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        doProfileDelete(
          selectedRows,
          $t({ defaultMessage: 'Profile{plural}' },
            { plural: selectedRows.length > 1 ? 's' : '' }),
          selectedRows[0].name,
          [{
            fieldName: 'activations',
            fieldText: $t({ defaultMessage: 'Network with <VenueSingular></VenueSingular>' })
          }],
          async () =>
            Promise.all(selectedRows.map(row => deleteSoftGreFn({ params: { policyId: row.id } })))
              .then(clearSelection)
        )
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)
  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'SoftGRE Profile ({count})' },
            { count: tableQuery.data?.totalCount ?? 0 }
          )
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            // eslint-disable-next-line max-len
            to={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.CREATE })}
            scopeKey={getScopeKeyByPolicy(PolicyType.SOFTGRE, PolicyOperation.CREATE)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Add SoftGRE Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table<SoftGreViewData>
          rowKey='id'
          settingsId={settingsId}
          columns={useColumns()}
          rowActions={allowedRowActions}
          rowSelection={
            allowedRowActions.length > 0 && { type: 'checkbox' }
          }
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
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
  const emptyVenues: { key: string, value: string }[] = []

  const { venueNameMap } = useGetVenuesQuery({
    params: { tenantId: params.tenantId },
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, {
    selectFromResult: ({ data }) => {
      return {
        venueNameMap: data?.data?.map(venue =>
          ({ key: venue.id, value: venue.name })) ?? emptyVenues
      }
    }
  })

  const columns: TableProps<SoftGreViewData>['columns'] = [
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
            to={getPolicyDetailsLink({
              type: PolicyType.SOFTGRE,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      fixed: 'left',
      sorter: true
    },
    {
      key: 'primaryGatewayAddress',
      title: $t({ defaultMessage: 'Primary Gateway' }),
      dataIndex: 'primaryGatewayAddress',
      fixed: 'left',
      sorter: true
    },
    {
      key: 'secondaryGatewayAddress',
      title: $t({ defaultMessage: 'Secondary Gateway' }),
      dataIndex: 'secondaryGatewayAddress',
      fixed: 'left',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Path MTU' }),
      key: 'mtuType',
      dataIndex: 'mtuType',
      sorter: true,
      render: (_, row) => {
        return MtuTypeEnum.AUTO === row.mtuType ?
          $t({ defaultMessage: 'Auto' }) :
          `${$t({ defaultMessage: 'Manual' })} (${row.mtuSize})`
      }
    },
    {
      title: $t({ defaultMessage: 'Client Disassociation' }),
      key: 'disassociateClientEnabled',
      dataIndex: 'disassociateClientEnabled',
      sorter: true,
      align: 'center',
      render: (_, row) => {
        return row.disassociateClientEnabled ?
          $t({ defaultMessage: 'On' }) :
          $t({ defaultMessage: 'Off' })
      }
    },
    {
      key: 'venueCount',
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venueCount',
      align: 'center',
      filterKey: 'activations.venueId',
      filterable: venueNameMap,
      sorter: true,
      render: function (_, row) {
        if (!row?.activations || row?.activations?.length === 0) return 0
        // eslint-disable-next-line max-len
        const tooltipItems = venueNameMap?.filter(v => row?.activations?.map(venue => venue?.venueId)!.includes(v.key)).map(v => v.value)
        // eslint-disable-next-line max-len
        return <SimpleListTooltip items={tooltipItems} displayText={row?.activations?.length} />
      }
    }
  ]
  return columns
}
