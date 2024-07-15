import { useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, Drawer, Table, TableProps }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { APStatus, seriesMappingAP }                                       from '@acx-ui/rc/components'
import { useApListQuery }                                                  from '@acx-ui/rc/services'
import { AP, ApDeviceStatusEnum, ApVenueStatusEnum, useTableQuery, Venue } from '@acx-ui/rc/utils'

export interface LbsServerVenueApsDrawerProps {
  venue: Venue,
  visible: boolean,
  setVisible: (v: boolean) => void
}

export function LbsServerVenueApsDrawer (props: LbsServerVenueApsDrawerProps) {
  const { $t } = useIntl()
  const { venue, visible, setVisible } = props
  const [ tableData, setTableData ] = useState<AP[]>([])
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const getVenueFilter = (venue: Venue) => ({
    venueId: [venue.id],
    deviceStatusSeverity: [ApVenueStatusEnum.OPERATIONAL]
  })

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      fields: ['name', 'deviceStatus', 'apMac'],
      filters: getVenueFilter(venue),
      search: {
        searchTargetFields: ['name', 'apMac']
      }
    },
    enableRbac: isWifiRbacEnabled
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

  const columns: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      sorter: true,
      disable: true,
      filterKey: 'deviceStatusSeverity',
      filterable: seriesMappingAP().map(item => ({ key: item.key, value: item.name })),
      render: (_, { deviceStatus }) => <APStatus status={deviceStatus as ApDeviceStatusEnum} />
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      key: 'apMac',
      searchable: true
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
      title={$t({ defaultMessage: '{venueName}: APs' }, { VenueName: venue.name })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      width={'800px'}
    />
  )
}