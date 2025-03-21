import { useMemo } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip }                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                              from '@acx-ui/feature-toggle'
import { EdgeTableCompatibilityWarningTooltip, SimpleListTooltip, ToolTipTableStyle, TrafficClassSettingsTable, useEdgeHqosCompatibilityData } from '@acx-ui/rc/components'
import {
  useDeleteEdgeHqosProfileMutation,
  useGetEdgeClusterListQuery,
  useGetEdgeHqosProfileViewDataListQuery
} from '@acx-ui/rc/services'
import {
  EdgeHqosViewData,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getScopeKeyByPolicy,
  IncompatibilityFeatures,
  PolicyOperation,
  PolicyType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes }                             from '@acx-ui/types'

import * as UI from '../styledComponents'

const EdgeHqosBandwidthTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const isEdgeCompatibilityEnabled = useIsSplitOn(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  const getQosViewDataPayload = {
    fields: [
      'id',
      'name',
      'description',
      'trafficClassSettings',
      'edgeClusterIds',
      'isDefault'
    ]
  }
  const settingsId = 'profiles-edge-qos-bandwidth-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeHqosProfileViewDataListQuery,
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
          })) ?? [],
          isLoading
        }
      }
    })

  const [deleteQos, { isLoading: isDeleteQosUpdating }] = useDeleteEdgeHqosProfileMutation()

  const currentServiceIds = useMemo(
    () => tableQuery.data?.data?.map(i => i.id!) ?? [],
    [tableQuery.data?.data])
  const skipFetchCompatibilities = currentServiceIds.length === 0

  // eslint-disable-next-line max-len
  const hqosCompatibilityData = useEdgeHqosCompatibilityData(currentServiceIds, skipFetchCompatibilities)

  const columns: TableProps<EdgeHqosViewData>['columns'] = [
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
          <Space>
            <TenantLink
              to={getPolicyDetailsLink({
                type: PolicyType.HQOS_BANDWIDTH,
                oper: PolicyOperation.DETAIL,
                policyId: row.id!
              })}>
              {row.name}
            </TenantLink>
            {isEdgeCompatibilityEnabled && <EdgeTableCompatibilityWarningTooltip
              serviceId={row.id!}
              featureName={IncompatibilityFeatures.HQOS}
              compatibility={hqosCompatibilityData.compatibilities}
            />}
          </Space>
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
      title: $t({ defaultMessage: 'HQoS Bandwidth Control' }),
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
        overlayClassName={ToolTipTableStyle.toolTipClassName}
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
        const edgeClusterIds = row?.edgeClusterIds??[]
        const tooltipItems = clusterOptions
          .filter(option => option.key && edgeClusterIds.includes(option.key))
          .map(option => option.value)
        return <SimpleListTooltip items={tooltipItems} displayText={edgeClusterIds.length} />
      }
    }
  ]

  const rowActions: TableProps<EdgeHqosViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.HQOS_BANDWIDTH, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.HQOS_BANDWIDTH, PolicyOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1 && selectedRows[0]?.isDefault !== true,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getPolicyDetailsLink({
            type: PolicyType.HQOS_BANDWIDTH,
            oper: PolicyOperation.EDIT,
            policyId: selectedRows[0].id!
          })}`
        })
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.HQOS_BANDWIDTH, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.HQOS_BANDWIDTH, PolicyOperation.DELETE),
      visible: (selectedRows) => selectedRows[0]?.isDefault !== true,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'HQoS' }),
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
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'HQoS Bandwidth ({count})' },
            { count: tableQuery.data?.totalCount })
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
            scopeKey={[EdgeScopes.CREATE]}
            // eslint-disable-next-line max-len
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.HQOS_BANDWIDTH, PolicyOperation.CREATE)}
            to={getPolicyRoutePath({
              type: PolicyType.HQOS_BANDWIDTH,
              oper: PolicyOperation.CREATE })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add HQoS Bandwidth Profile' })}</Button>
          </TenantLink>
        ])}
      />
      <ToolTipTableStyle.ToolTipStyle/>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteQosUpdating }
      ]}>
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          rowActions={allowedRowActions}
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

export default EdgeHqosBandwidthTable
