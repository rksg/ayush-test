import { Row }     from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Tooltip,
  showActionModal
} from '@acx-ui/components'
import { EdgeServiceStatusLight } from '@acx-ui/rc/components'
import {
  useVenuesListQuery,
  useGetEdgeListQuery
} from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  EdgeCentralizedForwardingViewData,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink
} from '@acx-ui/rc/utils'
import {
  Path,
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

const mockedEdgeCFDataList = [{
  id: 'mocked-cf-1',
  name: 'Amy_CF_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'Sting-Venue-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeName: 'sting-vSE-b490',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'amyTunnel',
  networkIds: ['8e22159cfe264ac18d591ea492fbc05a'],
  networkInfos: [{
    networkId: '8e22159cfe264ac18d591ea492fbc05a',
    networkName: 'amyNetwork'
  }],
  corePortMac: 'c2:58:00:ae:63:f2',
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersion: '1.0.0.100'
}, {
  id: 'mocked-cf-2',
  name: 'Amy_CF_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a8def420bd6c4f3e8b28114d6c78f237',
  venueName: 'Sting-Venue-3',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  edgeName: 'sting-vSE-b466',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'amyTunnel',
  networkIds: [],
  networkInfos: [],
  corePortMac: 'a2:51:0f:bc:89:c5',
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersions: '1.0.0.100'
}]

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

const EdgeCentralizedForwardingTable = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath: Path = useTenantLink('')

  // TODO: waiting for API ready

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

  const columns: TableProps<EdgeCentralizedForwardingViewData>['columns'] = [
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
              type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
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
      align: 'center',
      filterable: venueOptions,
      render: (__, row) => {
        return <TenantLink
          to={`/venues/${row.venueId}/venue-details/overview`}
        >
          {row.venueName || '' }
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeId',
      dataIndex: 'edgeId',
      align: 'center',
      filterable: edgeOptions,
      render: (__, row) => {
        return <TenantLink
          to={`/devices/edge/${row.edgeId}/details/overview`}
        >
          { row.edgeName || '' }
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile' }),
      key: 'tunnelProfileId',
      dataIndex: 'tunnelProfileId',
      align: 'center',
      render: (__, row) => {
        return <TenantLink
          to={getPolicyDetailsLink({
            type: PolicyType.TUNNEL_PROFILE,
            oper: PolicyOperation.DETAIL,
            policyId: row.tunnelProfileId!
          })}
        >
          { row.tunnelProfileName || '' }
        </TenantLink> }
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      key: 'networkIds',
      dataIndex: 'networkIds',
      align: 'center',
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
      align: 'center',
      render: (__, row) =>
        row?.edgeId
          ? <Row justify='center'>
            <EdgeServiceStatusLight
              data={row.edgeAlarmSummary ? [row.edgeAlarmSummary] : undefined}
            />
          </Row>
          : '--'
    }
    // {
    //   title: $t({ defaultMessage: 'Service Version' }),
    //   key: 'serviceVersion',
    //   dataIndex: 'serviceVersion',
    //   render: (__, row) => {
    //     return row.serviceVersion ?? '--'
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

  const isDeleteBtnDisable = (selectedRows: EdgeCentralizedForwardingViewData[]) => {
    let isActivatedOnEdge = selectedRows
      .filter(data => (data.networkIds?.length ?? 0) > 0)
      .length > 0
    return isActivatedOnEdge
  }

  const rowActions: TableProps<EdgeCentralizedForwardingViewData>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
            `${basePath.pathname}/` +
            getServiceDetailsLink({
              type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
              oper: ServiceOperation.EDIT,
              serviceId: selectedRows[0].id!
            })
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      disabled: isDeleteBtnDisable,
      tooltip: (selectedRows) => isDeleteBtnDisable(selectedRows)
        ? $t({ defaultMessage: 'Please deactivate the networks under Scope menu first' })
        : undefined,
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge Centralized Forwarding' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            // TODO: waiting for API ready
            clearSelection()
          }
        })
      }
    }
  ]

  return (
    <>
      <PageHeader
        title={$t(
          { defaultMessage: 'Edge Centralized Forwarding ({count})' },
          // TODO: waiting for API ready
          { count: mockedEdgeCFDataList.length }
          // { count: tableQuery.data?.totalCount }
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
              type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
              oper: ServiceOperation.CREATE
            })}
          >
            <Button type='primary'>
              {$t({ defaultMessage: 'Add Edge Centralized Forwarding Service' })}
            </Button>
          </TenantLink>
        ])}
      />
      <Table
        settingsId='services-centralized-forwarding-table'
        rowKey='id'
        columns={columns}
        rowSelection={hasAccess() && { type: 'radio' }}
        rowActions={filterByAccess(rowActions)}
        dataSource={mockedEdgeCFDataList}
      />
      {/* // TODO: waiting for API ready
      <Loader
        states={[
          tableQuery,
          { isLoading: false, isFetching: isDeletingCF }
        ]}
      >
        <Table
          settingsId='services-centralized-forwarding-table'
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
      */}
    </>
  )
}

export default EdgeCentralizedForwardingTable