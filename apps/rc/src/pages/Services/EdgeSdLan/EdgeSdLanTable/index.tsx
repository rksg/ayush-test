import { Row }     from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Tooltip,
  showActionModal,
  Loader
} from '@acx-ui/components'
import { EdgeServiceStatusLight }    from '@acx-ui/rc/components'
import {
  useVenuesListQuery,
  useGetEdgeListQuery,
  useDeleteEdgeSdLanMutation,
  useGetEdgeSdLanViewDataListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  EdgeSdLanViewData,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink,
  useTableQuery
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

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

const EdgeSdLanTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  const settingsId = 'services-edge-sd-lan-table'
  const tableQuery = useTableQuery({
    useQuery: useGetEdgeSdLanViewDataListQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name']
    },
    pagination: { settingsId }
  })

  const [deleteSdLan, { isLoading: isDeleting }] = useDeleteEdgeSdLanMutation()

  const { venueOptions } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map((item) => ({
            value: item.name,
            key: item.id
          }))
        }
      }
    }
  )

  const { edgeOptions } = useGetEdgeListQuery(
    { payload: edgeOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          edgeOptions: data?.data.map((item) => ({
            value: item.name,
            key: item.serialNumber
          }))
        }
      }
    }
  )

  const columns: TableProps<EdgeSdLanViewData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        return (
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.DETAIL,
              serviceId: row.id!
            })}
          >
            {row.name}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: true,
      filterable: venueOptions,
      render: (__, row) => {
        return <TenantLink
          to={`/venues/${row.venueId}/venue-details/overview`}
        >
          {row.venueName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeId',
      dataIndex: 'edgeId',
      sorter: true,
      filterable: edgeOptions,
      render: (__, row) => {
        return <TenantLink
          to={`/devices/edge/${row.edgeId}/details/overview`}
        >
          {row.edgeName}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile' }),
      key: 'tunnelProfileId',
      dataIndex: 'tunnelProfileId',
      sorter: true,
      render: (__, row) => {
        return <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.tunnelProfileId!
          })}
        >
          {row.tunnelProfileName}
        </TenantLink> }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networkIds',
      dataIndex: 'networkIds',
      align: 'center',
      sorter: true,
      render: (__, row) => {
        return (row.networkIds && row.networkIds.length)
          ? <Tooltip
            placement='bottom'
            title={
              row.networkIds.map(networkId => (
                <Row key={`edge-cf-tooltip-${networkId}`}>
                  { _.find(row.networkInfos, { networkId })?.networkName || '' }
                </Row>
              ))
            }
          >
            <span data-testid={`network-names-${row.id}`}>{row.networkIds.length}</span>
          </Tooltip>
          : row.networkIds?.length
      }
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      width: 80,
      render: (__, row) =>
        <Row justify='center'>
          <EdgeServiceStatusLight
            data={row.edgeAlarmSummary ? [row.edgeAlarmSummary] : []}
          />
        </Row>
    }
    // {
    //   title: $t({ defaultMessage: 'Service Version' }),
    //   key: 'serviceVersion',
    //   dataIndex: 'serviceVersion',
    //   render: (__, row) => {
    //     return row.serviceVersion ?? noDataDisplay
    //   }
    // },
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

  const rowActions: TableProps<EdgeSdLanViewData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
            `${basePath.pathname}/` +
            getServiceDetailsLink({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.EDIT,
              serviceId: selectedRows[0].id!
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
            entityName: $t({ defaultMessage: 'SD-LAN' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteSdLan({ params: { serviceId: row.id } })))
              .then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'SD-LAN ({count})' },
          { count: tableQuery.data?.totalCount }
        )}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'My Services' }),
            link: getServiceListRoutePath(true)
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            to={getServiceRoutePath({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.CREATE
            })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add SD-LAN Service' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Loader
        states={[
          tableQuery,
          { isLoading: false, isFetching: isDeleting }
        ]}
      >
        <Table
          settingsId={settingsId}
          rowKey='id'
          columns={columns}
          rowSelection={hasAccess() && { type: 'checkbox' }}
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

export default EdgeSdLanTable
