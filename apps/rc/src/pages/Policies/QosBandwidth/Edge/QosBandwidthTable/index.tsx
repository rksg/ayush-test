import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { TrafficClassSettingsTable }                                                       from '@acx-ui/rc/components'
import {
  useDeleteEdgeQosProfileMutation,
  useGetEdgeClusterListQuery,
  useGetEdgeQosProfileViewDataListQuery
} from '@acx-ui/rc/services'
import {
  EdgeQosViewData,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes }                             from '@acx-ui/types'
import { filterByAccess, hasPermission }          from '@acx-ui/user'


import * as UI from '../styledComponents'

const EdgeQosBandwidthTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const getQosViewDataPayload = {
    fields: [
      'id',
      'name',
      'description',
      'trafficClassSettings',
      'edgeClusterIds'
    ]
  }
  const settingsId = 'profiles-edge-qos-bandwidth-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeQosProfileViewDataListQuery,
    defaultPayload: getQosViewDataPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const clusterOptionsDefaultPayload = {
    fields: [
      'name',
      'clusterId'
    ],
    sortField: 'name',
    sortOrder: 'ASC',
    pageSize: 10000
  }

  const { clusterOptions } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data.map(item => ({
            value: item.name!,
            key: item.clusterId!
          })),
          isLoading
        }
      }
    })

  const [deleteQos, { isLoading: isDeleteQosUpdating }] = useDeleteEdgeQosProfileMutation()

  const columns: TableProps<EdgeQosViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      searchable: true,
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.QOS_BANDWIDTH,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      align: 'center',
      key: 'description',
      dataIndex: 'description',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'QoS Bandwidth Control' }),
      align: 'center',
      key: 'tracfficClass',
      dataIndex: 'tracfficClass',
      render: function (_, row) {
        return <Tooltip title={
          <TrafficClassSettingsTable
            trafficClassSettings={row.trafficClassSettings || []}
          />
        }
        placement='bottom'
        overlayClassName={UI.toolTipClassName}
        overlayInnerStyle={{ width: 415 }}
        dottedUnderline={true}>
          <UI.EyeOpenSolidCustom
            height={12}
            width={24}
            color={cssStr('--acx-accents-blue-60')}/>
        </Tooltip>
      }
    },
    {
      title: $t({ defaultMessage: 'Clusters' }),
      align: 'center',
      key: 'edgeClusterIds',
      dataIndex: 'edgeClusterIds',
      sorter: true,
      filterable: clusterOptions,
      render: function (_, row) {
        return row?.edgeClusterIds?.length
      }
    }
  ]

  const rowActions: TableProps<EdgeQosViewData>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getPolicyDetailsLink({
            type: PolicyType.QOS_BANDWIDTH,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id!
          })}`
        })
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'QoS' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            deleteQos({ params: { policyId: rows[0].id } })
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
          $t({ defaultMessage: 'QoS Bandwidth ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            scopeKey={[EdgeScopes.CREATE]}
            to={getPolicyRoutePath({
              type: PolicyType.QOS_BANDWIDTH,
              oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add QoS Bandwidth Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <UI.ToolTipStyle/>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteQosUpdating }
      ]}>
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          rowSelection={hasPermission({
            scopes: [EdgeScopes.UPDATE, EdgeScopes.DELETE]
          }) && { type: 'radio' }}
          rowActions={filterByAccess(rowActions)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter
        />
      </Loader>
    </>
  )
}

export default EdgeQosBandwidthTable
