import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Drawer, Table, TableProps } from '@acx-ui/components'
import { APStatus }                          from '@acx-ui/rc/components'
import { useApListQuery }                    from '@acx-ui/rc/services'
import { AP, ApDeviceStatusEnum, Venue }     from '@acx-ui/rc/utils'
import { TenantLink }                        from '@acx-ui/react-router-dom'
import { useTableQuery }                     from '@acx-ui/utils'

export interface LbsServerVenueApsDrawerProps {
  venue: Venue,
  visible: boolean,
  setVisible: (v: boolean) => void
}

export function LbsServerVenueApsDrawer (props: LbsServerVenueApsDrawerProps) {
  const { $t } = useIntl()
  const { venue, visible, setVisible } = props
  const [ tableData, setTableData ] = useState<AP[]>([])

  const getVenueFilter = (venue: Venue) => ({
    venueId: [venue.id]
  })

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      fields: [
        'name',
        'deviceStatus',
        'apMac',
        'lbsStatus',
        'serialNumber'],
      filters: getVenueFilter(venue),
      search: {
        searchTargetFields: ['name', 'apMac']
      },
      sortField: 'name',
      sortOrder: 'ASC'
    },
    enableRbac: true
  })

  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ...tableQuery.payload.filters,
        ...getVenueFilter(venue)
      }
    })

    if (tableQuery.data) {
      setTableData(tableQuery.data.data)
    }
  }, [venue.id, tableQuery.data?.data])

  const onClose = () => {
    setVisible(false)
  }

  const renderConnectionState = (conn: boolean) => {
    return conn ? $t({ defaultMessage: 'Connected' }) : $t({ defaultMessage: 'Disconnected' })
  }

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      searchable: true,
      render: (_, row, __, highlightFn) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {highlightFn(row.name || '--')}</TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      sorter: true,
      disable: true,
      render: (_, { deviceStatus }) => <APStatus status={deviceStatus as ApDeviceStatusEnum} />
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      key: 'apMac',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'LBS Mgmt. Connection' }),
      dataIndex: 'lbsStatus.managementConnected',
      key: 'lbsStatus.managementConnected',
      width: 128,
      sorter: true,
      render: (_, { lbsStatus }) =>
      {return renderConnectionState(lbsStatus?.managementConnected as boolean)}

    },
    {
      title: $t({ defaultMessage: 'LBS Server Connection' }),
      dataIndex: 'lbsStatus.serverConnected',
      key: 'lbsStatus.serverConnected',
      width: 128,
      sorter: true,
      render: (_, { lbsStatus }) =>
      { return renderConnectionState(lbsStatus?.serverConnected as boolean)}
    }
  ]

  const content = <Loader states={[tableQuery]}>
    <Table<AP>
      data-testid='LbsServerVenueApsTable'
      columns={columns}
      dataSource={tableData}
      rowKey={'serialNumber'}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
    />
  </Loader>

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: APs' }, { venueName: venue.name })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      width={'900px'}
    />
  )
}