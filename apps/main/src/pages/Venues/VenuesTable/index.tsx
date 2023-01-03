import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  StackedBarChart,
  cssStr,
  showActionModal,
  deviceStatusColors,
  getDeviceConnectionStatusColors
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                  from '@acx-ui/feature-toggle'
import { useVenuesListQuery, useDeleteVenueMutation }                                              from '@acx-ui/rc/services'
import { useTableQuery, ApDeviceStatusEnum, Venue, ApVenueStatusEnum, TableQuery, RequestPayload } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams }                                                      from '@acx-ui/react-router-dom'

function useColumns () {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      key: 'city',
      dataIndex: 'city',
      sorter: true,
      width: 120,
      render: function (data, row) {
        return `${row.country}, ${row.city}`
      }
    },
    {
      key: 'incidents',
      dataIndex: 'incidents',
      title: () => {
        return (
          <>
            { $t({ defaultMessage: 'Incidents' }) }
            <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
          </>
        )
      },
      align: 'center'
    },
    {
      key: 'health',
      dataIndex: 'health',
      title: () => {
        return (
          <>
            { $t({ defaultMessage: 'Health Score' }) }
            <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
          </>
        )
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Services' }),
      key: 'services',
      dataIndex: 'services',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      align: 'left',
      key: 'aggregatedApStatus',
      dataIndex: 'aggregatedApStatus',
      sorter: true,
      render: function (data, row) {
        const count = row.aggregatedApStatus
          ? Object.values(row.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
        return (<Space direction='horizontal' size={4}>
          { row.aggregatedApStatus
            ? getApStatusChart(row.aggregatedApStatus)
            : getEmptyStatusChart() }
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices`}
            children={count ? count : 0}
          />
        </Space>)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Clients' }),
      key: 'clients',
      dataIndex: 'clients',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/clients`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      key: 'switches',
      dataIndex: 'switches',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Clients' }),
      key: 'switchClients',
      dataIndex: 'switchClients',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/clients`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdges' }),
      key: 'edges',
      dataIndex: 'edges',
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink
            to={`/venues/${row.id}/venue-details/devices/edge`}
            children={data ? data : 0}
          />
        )
      }
    },
    {
      key: 'tags',
      dataIndex: 'tags',
      title: $t({ defaultMessage: 'Tags' })
    }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

export const useDefaultVenuePayload = (): RequestPayload => {
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  return {
    fields: [
      'check-all',
      'name',
      'description',
      'city',
      'country',
      'networks',
      'aggregatedApStatus',
      'switches',
      'switchClients',
      'clients',
      ...(isEdgeEnabled ? ['edges'] : []),
      'cog',
      'latitude',
      'longitude',
      'status',
      'id'
    ],
    filters: {},
    sortField: 'name',
    sortOrder: 'ASC'
  }
}

type VenueTableProps = {
  tableQuery: TableQuery<Venue, RequestPayload<unknown>, unknown>,
  rowSelection?: TableProps<Venue>['rowSelection']
}

export const VenueTable = ({ tableQuery, rowSelection }: VenueTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const columns = useColumns()

  const { tenantId } = useParams()
  const [
    deleteVenue,
    { isLoading: isDeleteVenueUpdating }
  ] = useDeleteVenueMutation()

  const rowActions: TableProps<Venue>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      navigate(`${selectedRows[0].id}/edit/details`, { replace: false })
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'Venues' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length,
          confirmationText: shouldShowConfirmation(rows) ? 'Delete' : undefined
        },
        onOk: () => { rows.length === 1 ?
          deleteVenue({ params: { tenantId, venueId: rows[0].id } })
            .then(clearSelection) :
          deleteVenue({ params: { tenantId }, payload: rows.map(item => item.id) })
            .then(clearSelection)
        }
      })
    }
  }]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteVenueUpdating }
    ]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={rowSelection}
      />
    </Loader>
  )
}

export function VenuesTable () {
  const { $t } = useIntl()
  const venuePayload = useDefaultVenuePayload()

  const tableQuery = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
    useQuery: useVenuesListQuery,
    defaultPayload: venuePayload
  })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Venues' })}
        extra={[
          <TenantLink to='/venues/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Venue' }) }</Button>
          </TenantLink>
        ]}
      />
      <VenueTable tableQuery={tableQuery} rowSelection={{ type: 'checkbox' }} />
    </>
  )
}

function getApStatusChart (apStatus: Venue['aggregatedApStatus']) {
  const barColors = getDeviceConnectionStatusColors()
  const apStatusMap = [[
    ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD,
    ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED,
    ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED
  ], [
    ApDeviceStatusEnum.REBOOTING
  ], [
    ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD,
    ApDeviceStatusEnum.INITIALIZING,
    ApDeviceStatusEnum.OFFLINE

  ], [
    ApDeviceStatusEnum.OPERATIONAL,
    ApDeviceStatusEnum.APPLYING_FIRMWARE,
    ApDeviceStatusEnum.APPLYING_CONFIGURATION
  ]]

  const series = Object.entries(apStatus).reduce((counts, [key, value]) => {
    const index = apStatusMap.findIndex(s =>
      String(s).toLowerCase().includes((key).toLowerCase()))
    counts[index] += value as number
    return counts
  }, [0, 0, 0, 0]).map((data, index) => ({
    name: `P${index + 1}`,
    value: data
  }))

  return <StackedBarChart
    style={{ height: 10, width: 100 }}
    data={[{
      category: 'apStatus',
      series: series
    }]}
    showLabels={false}
    showTotal={false}
    barColors={barColors}
  />
}

function getEmptyStatusChart () {
  return <StackedBarChart
    style={{ height: 10, width: 100 }}
    data={[{
      category: 'emptyStatus',
      series: [{
        name: '',
        value: 1
      }]
    }]}
    showTooltip={false}
    showLabels={false}
    showTotal={false}
    barColors={[cssStr(deviceStatusColors.empty)]}
  />
}

function shouldShowConfirmation (selectedVenues: Venue[]) {
  const venues = selectedVenues.filter(v => {
    return v['status'] !== ApVenueStatusEnum.IN_SETUP_PHASE || !_.isEmpty(v['aggregatedApStatus'])
  })
  return venues.length > 0
}
