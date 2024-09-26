import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeServiceStatusLight } from '@acx-ui/rc/components'
import {
  useDeleteNetworkSegmentationGroupMutation,
  useGetEdgeClusterListQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useNetworkListQuery,
  useSwitchListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  PersonalIdentityNetworksViewData,
  ServiceOperation,
  ServiceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { noDataDisplay }                                       from '@acx-ui/utils'

const getNetworkSegmentationPayload = {
  fields: [
    'id',
    'name',
    'tags',
    'networkIds',
    'venueInfoIds',
    'venueInfos',
    'edgeClusterInfos',
    'distributionSwitchInfoIds',
    'distributionSwitchInfos',
    'accessSwitchInfos',
    'edgeAlarmSummary'
  ]
}
const clusterOptionsDefaultPayload = {
  fields: ['name', 'clusterId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const networkDefaultPayload = {
  fields: ['name', 'id'],
  filters: { nwSubType: ['dpsk'] },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const switchDefaultPayload = {
  fields: ['name', 'switchMac'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const PersonalIdentityNetworkTable = () => {

  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('')
  const settingsId = 'services-network-segmentation-table'
  const tableQuery = useTableQuery({
    useQuery: useGetNetworkSegmentationViewDataListQuery,
    defaultPayload: getNetworkSegmentationPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })
  const [
    deleteNetworkSegmentationGroup,
    { isLoading: isNetworkSegmentationGroupDeleting }
  ] = useDeleteNetworkSegmentationGroupMutation()

  const { clusterOptions = [] } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          clusterOptions: data?.data.map(item => ({ value: item.name, key: item.clusterId }))
        }
      }
    })

  const getNetworkListQuery = isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery
  const { networkOptions = [] } = getNetworkListQuery(
    { payload: networkDefaultPayload },
    {
      selectFromResult: ({ data }) => ({
        networkOptions: data?.data.map(item => ({ key: item.id, value: item.name }))
      })
    })

  const { switchOptions = [] } = useSwitchListQuery(
    { payload: switchDefaultPayload,
      enableRbac: isSwitchRbacEnabled
    },
    {
      selectFromResult: ({ data }) => ({
        switchOptions: data?.data.map(item => ({ key: item.switchMac, value: item.name }))
      })
    })

  const columns: TableProps<PersonalIdentityNetworksViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (_, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edge',
      dataIndex: 'edgeClusterInfos',
      sorter: true,
      filterable: clusterOptions,
      filterKey: 'edgeClusterInfoIds',
      render: (_, row) => {
        const edgeInfo = row.edgeClusterInfos[0]
        return (
          <TenantLink to={`/devices/edge/${edgeInfo?.edgeClusterId}/details/overview`}>
            {edgeInfo?.edgeClusterName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networks',
      dataIndex: 'networkIds',
      align: 'center',
      filterable: networkOptions,
      filterKey: 'networkIds',
      render: (_, row) => {
        // TODO: use CountAndName
        // return <CountAndNamesTooltip data={{
        //   count: row.networkIds?.length,
        //   names: []
        // }}/>
        return (row.networkIds?.length)
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      align: 'center',
      filterable: switchOptions,
      filterKey: 'distributionSwitchInfoIds',
      render: (_, row) => {
        return (row.distributionSwitchInfos?.length || 0) + (row.accessSwitchInfos?.length || 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      align: 'center',
      render: (_, row) =>
        (row?.edgeClusterInfos?.length)
          ? <Row justify='center'>
            <EdgeServiceStatusLight data={row.edgeAlarmSummary} />
          </Row>
          : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'updateAvailable',
      dataIndex: 'updateAvailable',
      sorter: true,
      render: () => {
        return $t({ defaultMessage: 'No' })
      }
    // },
    // {
    //   title: $t({ defaultMessage: 'Service Version' }),
    //   key: 'serviceVersion',
    //   dataIndex: 'edgeClusterInfos',
    //   sorter: true,
    //   render: () => {
    //     // const edgeInfo = row.edgeClusterInfos[0]
    //     // TODO:
    //     return (
    //       ''// edgeInfo?.serviceVersion
    //     )
    //   }
    }
  ]

  const rowActions: TableProps<PersonalIdentityNetworksViewData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByService(ServiceType.NETWORK_SEGMENTATION, ServiceOperation.EDIT),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/${getServiceDetailsLink({
            type: ServiceType.NETWORK_SEGMENTATION,
            oper: ServiceOperation.EDIT,
            serviceId: selectedRows[0].id!
          })}`
        }, { state: { from: location } })
      }
    },
    {
      scopeKey: getScopeKeyByService(ServiceType.NETWORK_SEGMENTATION, ServiceOperation.DELETE),
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Personal Identity Network' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          okText: $t({ defaultMessage: 'Delete' }),
          onOk: () => {
            deleteNetworkSegmentationGroup({ params: { serviceId: rows[0].id } })
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
          $t({ defaultMessage: 'Personal Identity Network ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink state={{ from: location }}
            to={getServiceRoutePath({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.CREATE
            })}
            // eslint-disable-next-line max-len
            scopeKey={getScopeKeyByService(ServiceType.NETWORK_SEGMENTATION, ServiceOperation.CREATE)}
          >
            {/* eslint-disable-next-line max-len */}
            <Button type='primary'>{$t({ defaultMessage: 'Add Personal Identity Network' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isNetworkSegmentationGroupDeleting }
      ]}>
        <Table
          settingsId={settingsId}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
    </>
  )
}

export default PersonalIdentityNetworkTable
