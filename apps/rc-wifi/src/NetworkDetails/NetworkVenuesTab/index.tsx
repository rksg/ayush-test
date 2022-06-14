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
  const [supportTriBandRadio, setSupportTriBandRadio] = useState(false)
  const { tenantId } = useParams()
  const userSetting = useGetAllUserSettingsQuery({ params: { tenantId } })
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
        const activatedVenue = networkQuery.data.venues?.find(
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
  }, [tableQuery.data, networkQuery])

  useEffect(()=>{
    if (userSetting.data) {
      const triRadio = getUserSettingsFromDict(userSetting.data,
        Constants.triRadioUserSettingsKey) as String === 'true'
      setSupportTriBandRadio(triRadio)
    }
  }, [userSetting])


  const activateNetwork = async (checked: boolean, row: any) => {
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
    if (!checked && network.venues) {
      network.venues.forEach((venue: { venueId: any; id: any }) => {
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
      dataIndex: 'networks',
      render: function (data) {
        return data ? data.count : 0
      }
    },
    {
      title: 'Wi-Fi APs',
      dataIndex: 'aggregatedApStatus',
      render: function (data) {
        if (data) {
          let sum = 0
          Object.keys(data).forEach((key) => {
            sum = sum + data[key]
          })
          return sum
        }
        return 0
      }
    },
    {
      title: 'Activated',
      dataIndex: 'activated',
      render: function (data, row) {
        return <Switch checked={data.isActivated}
          onClick={
            (checked: boolean, event: Event) => {
              data.isActivated = checked
              activateNetwork(checked, row)
              event.stopPropagation()
            }
          }/>
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
      tableQuery, { isLoading: isAddNetworkUpdating }, { isLoading: isDeleteNetworkUpdating }
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
