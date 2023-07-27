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
import {
  useDeleteNetworkSegmentationGroupMutation,
  useGetEdgeListQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useNetworkListQuery,
  useSwitchListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  NetworkSegmentationGroupViewData,
  ServiceOperation,
  ServiceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                           from '@acx-ui/user'

const getNetworkSegmentationPayload = {
  fields: [
    'id',
    'name',
    'tags',
    'networkIds',
    'venueInfos',
    'edgeInfos',
    'distributionSwitchInfos',
    'accessSwitchInfos'
  ]
}
const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}
const edgeOptionsDefaultPayload = {
  fields: ['name', 'serialNumber'],
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

const NetworkSegmentationTable = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tableQuery = useTableQuery({
    useQuery: useGetNetworkSegmentationViewDataListQuery,
    defaultPayload: getNetworkSegmentationPayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    }
  })
  const [
    deleteNetworkSegmentationGroup,
    { isLoading: isNetworkSegmentationGroupDeleting }
  ] = useDeleteNetworkSegmentationGroupMutation()

  const { venueOptions = [] } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map(item => ({ value: item.name, key: item.id }))
        }
      }
    })

  const { edgeOptions = [] } = useGetEdgeListQuery(
    { payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          edgeOptions: data?.data.map(item => ({ value: item.name, key: item.serialNumber }))
        }
      }
    })

  const { networkOptions = [] } = useNetworkListQuery(
    { payload: networkDefaultPayload },
    {
      selectFromResult: ({ data }) => ({
        networkOptions: data?.data.map(item => ({ key: item.id, value: item.name }))
      })
    })

  const { switchOptions = [] } = useSwitchListQuery(
    { payload: switchDefaultPayload },
    {
      selectFromResult: ({ data }) => ({
        switchOptions: data?.data.map(item => ({ key: item.switchMac, value: item.name }))
      })
    })

  const columns: TableProps<NetworkSegmentationGroupViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: (data, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: 'venueInfos',
      sorter: true,
      filterable: venueOptions,
      filterKey: 'venueInfoIds',
      render: (data, row) => {
        const venueInfo = row.venueInfos[0]
        return (
          <TenantLink to={`/venues/${venueInfo?.venueId}/venue-details/overview`}>
            {venueInfo?.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edge',
      dataIndex: 'edgeInfos',
      sorter: true,
      filterable: edgeOptions,
      filterKey: 'edgeInfoIds',
      render: (data, row) => {
        const edgeInfo = row.edgeInfos[0]
        return (
          <TenantLink to={`/devices/edge/${edgeInfo?.edgeId}/details/overview`}>
            {edgeInfo?.edgeName}
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
      render: (data, row) => {
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
      render: (data, row) => {
        return (row.distributionSwitchInfos?.length || 0) + (row.accessSwitchInfos?.length || 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'updateAvailable',
      dataIndex: 'updateAvailable',
      sorter: true,
      render: () => {
        return $t({ defaultMessage: 'No' })
      }
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'serviceVersion',
      dataIndex: 'edgeInfos',
      sorter: true,
      render: (data, row) => {
        const edgeInfo = row.edgeInfos[0]
        return (
          edgeInfo?.serviceVersion
        )
      }
    }
  ]

  const rowActions: TableProps<NetworkSegmentationGroupViewData>['rowActions'] = [
    {
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
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Network Segmentation' }),
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

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: 'Network Segmentation ({count})' },
            { count: tableQuery.data?.totalCount })
        }
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ] : [
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) }
        ]}
        extra={filterByAccess([
          <TenantLink state={{ from: location }}
            to={getServiceRoutePath({
              type: ServiceType.NETWORK_SEGMENTATION,
              oper: ServiceOperation.CREATE
            })}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Network Segmenation' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isNetworkSegmentationGroupDeleting }
      ]}>
        <Table
          settingsId='services-network-segmentation-table'
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
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

export default NetworkSegmentationTable
