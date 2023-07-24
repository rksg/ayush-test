import { useEffect, useState } from 'react'

import { Switch }  from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, Button, Drawer, Table, TableProps }                       from '@acx-ui/components'
import { APStatus, seriesMappingAP }                                       from '@acx-ui/rc/components'
import { useApListQuery }                                                  from '@acx-ui/rc/services'
import { AP, ApDeviceStatusEnum, ApVenueStatusEnum, useTableQuery, Venue } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                       from '@acx-ui/user'

export interface SimpleApRecord {
  serialNumber: string;
  name?: string;
}

export interface MdnsProxyScopeApDrawerProps {
  venue: Venue;
  selectedApsId?: string[];
  visible: boolean;
  setVisible: (v: boolean) => void;
  setAps: (venue: Venue, aps: SimpleApRecord[]) => void;
}

export function MdnsProxyScopeApDrawer (props: MdnsProxyScopeApDrawerProps) {
  const { $t } = useIntl()
  const { venue, selectedApsId, visible, setVisible, setAps } = props
  const [ activatedAps, setActivatedAps ] = useState<SimpleApRecord[]>([])
  const [ tableData, setTableData ] = useState<AP[]>([])
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])

  const getTableFiltersForVenue = (venue: Venue) => ({
    venueId: [venue.id],
    deviceStatusSeverity: [ApVenueStatusEnum.OPERATIONAL]
  })

  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      // eslint-disable-next-line max-len
      fields: ['name', 'model', 'apMac', 'venueName', 'venueId', 'clients', 'serialNumber', 'deviceStatus'],
      filters: getTableFiltersForVenue(venue),
      search: {
        searchTargetFields: ['name', 'model']
      }
    }
  })

  // Set AP table data source
  useEffect(() => {
    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        ...tableQuery.payload.filters,
        ...getTableFiltersForVenue(venue)
      }
    })

    if (tableQuery.data) {
      setTableData(tableQuery.data.data)
    }
  }, [venue.id, tableQuery.data?.data])

  // Update activated APs value
  useEffect(() => {
    if (!visible) {
      return
    }

    if (selectedApsId && selectedApsId.length > 0) {
      setActivatedAps(selectedApsId.map(a => ({ serialNumber: a })))
    } else if (activatedAps.length > 0) {
      setActivatedAps([])
    }

  }, [venue.id, visible])

  const onClose = () => {
    setVisible(false)
    setSelectedRowKeys([])
    setActivatedAps([])
  }

  const onSave = () => {
    setVisible(false)
    setAps(venue, activatedAps)
    setSelectedRowKeys([])
    setActivatedAps([])
  }

  const handleActivateAp = (isActivated: boolean, selectedAps: AP[]) => {
    let result: SimpleApRecord[] = []

    if (isActivated) {
      const simpleSelectedAps = selectedAps.map(selectedAp => ({
        serialNumber: selectedAp.serialNumber,
        name: selectedAp.name
      }))

      result = _.uniqBy([...activatedAps, ...simpleSelectedAps], (ap) => ap.serialNumber)
    } else {
      result = _.remove(activatedAps, (activatedAp: SimpleApRecord) => {
        // eslint-disable-next-line max-len
        return !selectedAps.some((selectedAp: AP) => selectedAp.serialNumber === activatedAp.serialNumber)
      })
    }

    setActivatedAps(result)
  }

  const rowActions: TableProps<AP>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows: AP[]) => {
        handleActivateAp(true, rows)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (rows: AP[]) => {
        handleActivateAp(false, rows)
      }
    }
  ]

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
      render: (status: unknown) => <APStatus status={status as ApDeviceStatusEnum} />
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      key: 'model',
      searchable: true,
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      key: 'clients',
      sorter: true,
      render: function (data) {
        return data ? data : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Apply' }),
      dataIndex: 'activated',
      key: 'activated',
      render: function (data, row: AP) {
        const isActivated = activatedAps.some((a: SimpleApRecord) => {
          return a.serialNumber === row.serialNumber
        })

        return <Switch
          checked={isActivated}
          onClick={(checked, event) => {
            event.stopPropagation()
            handleActivateAp(checked, [row])
          }}
        />
      }
    }
  ]

  const content = <>
    <p>{ $t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Select the APs that the mDNS Proxy Service will be applied to at venue “{venueName}”.'
    }, {
      venueName: venue.name
    }) }</p>
    <p>{ $t({
      defaultMessage: 'It is suggested to only enable this service on a single AP per service.'
    }) }</p>
    <Loader states={[tableQuery]}>
      <Table<AP>
        data-testid='MdnsProxyScopeApTable'
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        dataSource={tableData}
        rowKey='serialNumber'
        rowSelection={hasAccess() && { type: 'checkbox', selectedRowKeys }}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
  </>

  const footer = [
    <Button
      key='cancelBtn'
      onClick={onClose}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>,
    <Button
      key='saveBtn'
      onClick={onSave}
      type={'primary'}>
      {$t({ defaultMessage: 'OK' })}
    </Button>
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select APs' }, { venueName: venue.name })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      footer={footer}
      width={'800px'}
    />
  )
}
