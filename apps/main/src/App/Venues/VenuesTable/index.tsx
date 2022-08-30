import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader,
  StackedBarChart,
  cssStr,
  deviceStatusColors,
  getDeviceConnectionStatusColors
} from '@acx-ui/components'
import { useVenuesListQuery }                       from '@acx-ui/rc/services'
import { useTableQuery, ApDeviceStatusEnum, Venue } from '@acx-ui/rc/utils'
import { TenantLink }                               from '@acx-ui/react-router-dom'

function useColumns () {
  const { $t } = useIntl()
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
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      align: 'center',
      key: 'aggregatedApStatus',
      dataIndex: 'aggregatedApStatus',
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
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' })
    }
  ]

  return columns
}

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
  const { $t } = useIntl()
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
          columns={useColumns()}
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
        title={$t({ defaultMessage: 'Venues' })}
        extra={[
          <TenantLink to='/venues/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add Venue' }) }</Button>
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
