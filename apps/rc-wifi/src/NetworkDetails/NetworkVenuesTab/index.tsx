import React, { useEffect, useState } from 'react'

import { Switch } from 'antd'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useGetAllUserSettingsQuery,
  UserSettings,
  useVenueListQuery,
  Venue
} from '@acx-ui/rc/services'
import { Constants, useTableQuery, getUserSettingsFromDict } from '@acx-ui/rc/utils'
import { useParams }                                         from '@acx-ui/react-router-dom'

import { useGetNetwork } from '../services'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status'
  ]
}

const defaultArray: Venue[] = []
// TODO: const notificationMessage = 'No venues activating this network. Use the ON/OFF switches in the list to select the activating venues\n';

export function NetworkVenuesTab () {
  const tableQuery = useTableQuery({
    useQuery: useVenueListQuery,
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const { tenantId } = useParams()
  const userSetting = useGetAllUserSettingsQuery({ params: { tenantId } })
  const supportTriBandRadio = String(getUserSettingsFromDict(userSetting.data as UserSettings,
    Constants.triRadioUserSettingsKey)) === 'true'
  const networkQuery = useGetNetwork()
  const [
    addNetworkVenue,
    { isLoading: isAddNetworkUpdating }
  ] = useAddNetworkVenueMutation()
  const [
    deleteNetworkVenue,
    { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkVenueMutation()

  useEffect(()=>{
    if (tableQuery.data && networkQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = networkQuery.data?.venues?.find(
          (i: { venueId: string }) => i.venueId === item.id
        )
        data.push({
          ...item,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })
      setTableData(data)
    }
  }, [tableQuery.data, networkQuery.data])

  const activateNetwork = async (checked: boolean, row: Venue) => {
    // TODO: Service
    // if (checked) {
    //   if (row.allApDisabled) {
    //     manageAPGroups(row);
    //   }
    // }
    const network = networkQuery.data
    const defaultVenueData = {
      apGroups: [],
      scheduler: {
        type: 'ALWAYS_ON'
      },
      isAllApGroups: true,
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      venueId: row.id,
      networkId: (network && network?.id) ? network.id : ''
    }
    const isWPA3security = row.wlan && row.wlan.wlanSecurity === 'WPA3'
    if (supportTriBandRadio && isWPA3security) {
      defaultVenueData.allApGroupsRadioTypes.push('6-GHz')
    }

    let deactivateNetworkVenueId = ''
    if (!checked && network?.venues) {
      network?.venues.forEach((venue: { venueId: string; id: string }) => {
        if (venue.venueId === row.id || venue.id === row.id) {
          deactivateNetworkVenueId = venue.id
        }
      })
    }
    if (!row.allApDisabled || !checked) {
      if (checked) { // activate
        addNetworkVenue({ params: { tenantId }, payload: defaultVenueData })
      } else { // deactivate
        deleteNetworkVenue({ params: { tenantId, networkVenueId: deactivateNetworkVenueId } })
      }
    }
  }

  const columns: TableProps<Venue>['columns'] = [
    {
      title: 'Venue',
      dataIndex: 'name',
      sorter: true
    },
    {
      title: 'City',
      dataIndex: 'city',
      sorter: true
    },
    {
      title: 'Country',
      dataIndex: 'country',
      sorter: true
    },
    {
      title: 'Networks',
      dataIndex: ['networks', 'count'],
      render: function (data) { return data ? data : 0 },
      align: 'center'
    },
    {
      title: 'Wi-Fi APs',
      dataIndex: 'aggregatedApStatus',
      align: 'center',
      render: function (data, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      title: 'Activated',
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked: boolean, event: Event) => {
            activateNetwork(checked, row)
            event.stopPropagation()
          }}
        />
      }
    },
    {
      title: 'APs',
      dataIndex: 'aps',
      width: '80px',
      render: function (data, row) {
        return row.activated.isActivated ? 'All APs' : ''
      }
    },
    {
      title: 'Radios',
      dataIndex: 'radios',
      width: '140px',
      render: function (data, row) {
        return row.activated.isActivated ? '2.4 GHz / 5 GHz' : ''
      }
    },
    {
      title: 'Scheduling',
      dataIndex: 'scheduling',
      render: function (data, row) {
        return row.activated.isActivated ? '24/7' : ''
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery,
      networkQuery,
      { isLoading: false, isFetching: isAddNetworkUpdating },
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        rowKey='id'
        rowSelection={{
          type: 'checkbox',
          ...tableQuery.rowSelection
        }}
        onRow={(record) => ({
          onClick: () => { tableQuery.onRowClick(record) }
        })}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
