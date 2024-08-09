import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
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
  TrafficClassSetting,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes }                             from '@acx-ui/types'
import { filterByAccess, hasPermission }          from '@acx-ui/user'

import * as UI from './styledComponents'

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

  const genClassTextForToolTip =
  (trafficClass: string, priority: string, priorityScheduling: boolean) => {
    const capFirstClass = _.capitalize(trafficClass)
    const capFirstPriority = _.capitalize(priority)
    const starSolidWhite = priorityScheduling === true ?
      <UI.StarSolidCustom
        height={8}
        width={12}
        color={cssStr('--acx-primary-white')}/> : undefined
    return <>{capFirstClass + ' (' + capFirstPriority + ') '}{starSolidWhite}</>
  }

  const genBandWidthTextForToolTip = (bandwidth: number) => {
    return bandwidth ? bandwidth + '%' : ''
  }

  const tracfficClassColumns: TableProps<TrafficClassSetting>['columns'] = [
    {
      key: 'trafficClass',
      title: $t({ defaultMessage: 'Class' }),
      dataIndex: 'trafficClass',
      render: function (_, row) {
        return genClassTextForToolTip(row.trafficClass, row.priority, row.priorityScheduling)
      }
    },
    {
      key: 'minBandwidth',
      title: $t({ defaultMessage: 'Guaranteed BW' }),
      dataIndex: 'minBandwidth',
      render: function (_, row) {
        return genBandWidthTextForToolTip(row.minBandwidth)
      }
    },
    {
      key: 'maxBandwidth',
      title: $t({ defaultMessage: 'Max BW' }),
      dataIndex: 'maxBandwidth',
      render: function (_, row) {
        return genBandWidthTextForToolTip(row.maxBandwidth)
      }
    }
  ]

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
          <Table<TrafficClassSetting>
            type='compactBordered'
            style={{ width: 400 }}
            columns={tracfficClassColumns}
            dataSource={row.trafficClassSettings}
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
        return row.edgeClusterIds.length
      }
    }
  ]

  const rowActions: TableProps<EdgeQosViewData>['rowActions'] = [
    {
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
            deleteQos({ params: { qosProfileId: rows[0].id } })
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
          // eslint-disable-next-line max-len
          <TenantLink to={getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.CREATE })}>
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
