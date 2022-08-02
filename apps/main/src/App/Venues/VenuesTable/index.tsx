import { Space } from 'antd'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  StackedBarChart,
  getDeviceConnectionStatusColors
} from '@acx-ui/components'
import { useVenuesListQuery, Venue }         from '@acx-ui/rc/services'
import { useTableQuery, ApDeviceStatusEnum } from '@acx-ui/rc/utils'
import { TenantLink }                        from '@acx-ui/react-router-dom'

const columns: TableProps<Venue>['columns'] = [
  {
    title: 'Venue',
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
    title: 'Address',
    dataIndex: 'city',
    sorter: true,
    width: 120,
    render: function (data, row) {
      return `${row.country}, ${row.city}`
    }
  },
  {
    title: () => {
      return (
        <Space direction='vertical' size={0}>
          Incidents
          <span style={{ fontSize: '12px', fontWeight: '400' }}>Last 24 hours</span>
        </Space>
      )
    },
    align: 'center'
  },
  {
    title: () => {
      return (
        <Space direction='vertical' size={0}>
          Health Score
          <span style={{ fontSize: '12px', fontWeight: '400' }}>Last 24 hours</span>
        </Space>
      )
    },
    align: 'center'
  },
  {
    title: 'Services',
    align: 'center'
  },
  {
    title: 'Wi-Fi APs',
    align: 'center',
    dataIndex: 'aggregatedApStatus',
    render: function (data, row) {
      const count = row.aggregatedApStatus
        ? Object.values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
        : 0
      return (<Space direction='vertical' size={4}>
        <TenantLink
          to={`/venues/${row.id}/venue-details/devices`}
          children={count ? count : 0}
        />
        { row.aggregatedApStatus && getApStatusChart(row.aggregatedApStatus) }
      </Space>)
    }
  },
  {
    title: 'Wi-Fi Clients',
    dataIndex: 'clients',
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
    title: 'Switches',
    dataIndex: 'switches',
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
    title: 'Switch Clients',
    dataIndex: 'switchClients',
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
    title: 'Tags'
  }
]

const defaultPayload = {
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

export function VenuesTable () {
  const VenuesTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVenuesListQuery,
      defaultPayload
    })

    return (
      <Loader states={[
        tableQuery
      ]}>
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowSelection={{ type: 'checkbox' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title='Venues'
        extra={[
          <TenantLink to='/venues/create' key='add'>
            <Button type='primary'>Add Venue</Button>
          </TenantLink>
        ]}
      />
      <VenuesTable />
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
    const index = apStatusMap.findIndex(s => s.includes(key as ApDeviceStatusEnum))
    counts[index] += value as number
    return counts
  }, [0, 0, 0, 0]).map((data, index) => {
    return {
      name: `P${index + 1}`,
      value: data
    }
  })

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