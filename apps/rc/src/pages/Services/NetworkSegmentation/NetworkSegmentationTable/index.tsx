import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { useDeleteNetworkSegmentationGroupMutation, useGetEdgeListQuery, useGetNetworkSegmentationStatsListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  NetworkSegmentationGroupStats,
  ServiceOperation,
  ServiceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                                 from '@acx-ui/user'

const getNetworkSegmentationPayload = {
  fields: [
    'id',
    'name',
    'tags',
    'networkIds',
    'venueInfos',
    'edgeInfos'
  ],
  sortField: 'name',
  sortOrder: 'ASC'
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

const NetworkSegmentationTable = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('')
  const tableQuery = useTableQuery({
    useQuery: useGetNetworkSegmentationStatsListQuery,
    defaultPayload: getNetworkSegmentationPayload
  })
  const { venueOptions } = useVenuesListQuery(
    { params, payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.map(item => ({ key: item.id, value: item.name })),
          isLoading
        }
      }
    })
  const { edgeOptions } = useGetEdgeListQuery(
    { params, payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          edgeOptions: data?.data.map(item => ({ key: item.serialNumber, value: item.name })),
          isLoading
        }
      }
    })
  const [
    deleteNetworkSegmentationGroup,
    { isLoading: isNetworkSegmentationGroupDeleting }
  ] = useDeleteNetworkSegmentationGroupMutation()

  const columns: TableProps<NetworkSegmentationGroupStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
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
      dataIndex: 'venue',
      render: (data, row) => {
        const venueId = row.venueInfos[0]?.venueId
        return (
          <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
            {venueOptions && venueOptions.find(item => item.key === venueId)?.value}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edge',
      dataIndex: 'edge',
      render: (data, row) => {
        const edgeId = row.edgeInfos[0]?.edgeId
        return (
          <TenantLink to={`/devices/edge/${edgeId}/edge-details/overview`}>
            {edgeOptions && edgeOptions.find(item => item.key === edgeId)?.value}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networks',
      dataIndex: 'networks',
      align: 'center',
      render: (data, row) => {
        return (row.networkIds?.length)
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'health',
      dataIndex: 'health'
    },
    {
      title: $t({ defaultMessage: 'Update Available' }),
      key: 'updateAvailable',
      dataIndex: 'updateAvailable'
    },
    {
      title: $t({ defaultMessage: 'Service Version' }),
      key: 'version',
      dataIndex: ['version']
    },
    {
      title: $t({ defaultMessage: 'Tags' }),
      key: 'tags',
      dataIndex: 'tags'
    }
  ]

  const rowActions: TableProps<NetworkSegmentationGroupStats>['rowActions'] = [
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
        breadcrumb={[
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
          columns={columns}
          dataSource={tableQuery?.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    </>
  )
}

export default NetworkSegmentationTable
