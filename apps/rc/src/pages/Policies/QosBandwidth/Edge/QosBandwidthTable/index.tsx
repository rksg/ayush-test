import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, PageHeader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import { EyeOpenSolid }                                                                    from '@acx-ui/icons'
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
import { filterByAccess, hasAccess }              from '@acx-ui/user'

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

  const capitalizeFirstLetter = (str : string) => {
    let lowerCaseStr = str.toLowerCase()
    return lowerCaseStr?.charAt?.(0)?.toUpperCase() + lowerCaseStr?.slice(1)
  }

  const genClassTextForToolTip =
  (trafficClass: string, priority: string, priorityScheduling: boolean) => {
    const capFirstClass = capitalizeFirstLetter(trafficClass)
    const starSolidWhite = priorityScheduling === true ?
      <UI.StarSolidCustom stroke={cssStr('--acx-primary-white')}
        height={8}
        width={12}
        color={cssStr('--acx-primary-white')}/> : undefined
    return <>{capFirstClass + '(' + priority + ')'}{starSolidWhite}</>
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
      title: $t({ defaultMessage: 'BW' }),
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
      key: 'edgeNum',
      dataIndex: 'edgeNum',
      sorter: true,
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
          <EyeOpenSolid />
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
          rowSelection={hasAccess() && { type: 'radio' }}
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
