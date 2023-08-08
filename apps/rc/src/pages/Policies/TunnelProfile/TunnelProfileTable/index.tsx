import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  useDeleteTunnelProfileMutation,
  useGetNetworkSegmentationViewDataListQuery,
  useGetTunnelProfileViewDataListQuery,
  useNetworkListQuery
}                                    from '@acx-ui/rc/services'
import { getPolicyDetailsLink, getPolicyListRoutePath, getPolicyRoutePath, MtuTypeEnum, PolicyOperation, PolicyType, TunnelProfileViewData, useTableQuery } from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useTenantLink, useParams }                                                                                          from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                                                                                        from '@acx-ui/user'
const defaultTunnelProfileTablePayload = {}

const TunnelProfileTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')
  const params = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = useTableQuery({
    useQuery: useGetTunnelProfileViewDataListQuery,
    defaultPayload: defaultTunnelProfileTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    }
  })
  const { nsgOptions } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data }) => ({
      nsgOptions: data?.data
        ? data.data.map(item => ({ key: item.id, value: item.name }))
        : []
    })
  })
  const { networkOptions } = useNetworkListQuery({
    payload: {
      fields: ['name', 'id'],
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10000
    }
  }, {
    selectFromResult: ({ data }) => ({
      networkOptions: data?.data
        ? data.data.map(item => ({ key: item.id, value: item.name }))
        : []
    })
  })
  const [deleteTunnelProfile] = useDeleteTunnelProfileMutation()

  const columns: TableProps<TunnelProfileViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.id
          })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Gateway Path MTU Mode' }),
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
      title: $t({ defaultMessage: 'Force Fragmentation' }),
      key: 'forceFragmentation',
      dataIndex: 'forceFragmentation',
      sorter: true,
      render: (_, row) => {
        return row.forceFragmentation ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' })
      }
    },
    {
      title: $t({ defaultMessage: 'Network Segmentation' }),
      key: 'networkSegmentationIds',
      dataIndex: 'networkSegmentationIds',
      align: 'center',
      filterable: nsgOptions,
      sorter: true,
      render: (_, row) => row.networkSegmentationIds?.length || 0
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networkIds',
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkOptions,
      sorter: true,
      render: (_, row) => row.networkIds?.length || 0
    }
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // }
  ]

  const rowActions: TableProps<TunnelProfileViewData>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1
        && selectedRows[0].id !== params.tenantId, // Default Tunnel profile cannot Edit
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id
          })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Policy' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteTunnelProfile({ params: { id: rows[0].id } })
                .then(clearSelection) :
              deleteTunnelProfile({ payload: rows.map(item => item.id) })
                .then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={
          $t(
            { defaultMessage: 'Tunnel Profile ({count})' },
            { count: tableQuery.data?.totalCount }
          )
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ] : [{
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Tunnel Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[tableQuery]}>
        <Table
          rowKey='id'
          columns={columns}
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
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

export default TunnelProfileTable
