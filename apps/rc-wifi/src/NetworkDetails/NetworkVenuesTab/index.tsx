import React, { useEffect, useState } from 'react'

import { Switch } from 'antd'
import _          from 'lodash'

import {
  Alert,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useGetAllUserSettingsQuery,
  UserSettings,
  useUpdateNetworkDeepMutation,
  useVenueListQuery,
  Venue
} from '@acx-ui/rc/services'
import { Constants, useTableQuery, getUserSettingsFromDict, NetworkSaveData } from '@acx-ui/rc/utils'
import { useParams }                                                          from '@acx-ui/react-router-dom'

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
/* eslint-disable max-len */
const notificationMessage = 'No venues activating this network. Use the ON/OFF switches in the list to select the activating venues'

export function NetworkVenuesTab () {
  const tableQuery = useTableQuery({
    useQuery: useVenueListQuery,
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const params = useParams()
  const [updateNetworkDeep] = useUpdateNetworkDeepMutation()
  const userSetting = useGetAllUserSettingsQuery({ params: { tenantId: params.tenantId } })
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

  const generateDefaultNetworkVenue = (venueId: string) => {
    const network = networkQuery.data
    return {
      apGroups: [],
      scheduler: {
        type: 'ALWAYS_ON'
      },
      isAllApGroups: true,
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      venueId: venueId,
      networkId: (network && network?.id) ? network.id : ''
    }
  }

  const activateNetwork = async (checked: boolean, row: Venue) => {
    // TODO: Service
    // if (checked) {
    //   if (row.allApDisabled) {
    //     manageAPGroups(row);
    //   }
    // }
    const network = networkQuery.data
    const defaultVenueData = generateDefaultNetworkVenue(row.id) 
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
        addNetworkVenue({ params: { tenantId: params.tenantId }, payload: defaultVenueData })
      } else { // deactivate
        /* eslint-disable max-len */
        deleteNetworkVenue({ params: { tenantId: params.tenantId, networkVenueId: deactivateNetworkVenueId } })
      }
    }
  }
    
  const handleEditNetwork = (network: NetworkSaveData, clearSelection: () => void) => {
    updateNetworkDeep({ params, payload: network }).then(clearSelection)
  }

  const activateSelected = (venues: any[], activatingVenues: any[]) => {
    const enabledNotActivatedVenues:string[] = []
    const networkVenues = [...venues]
    if (tableData && tableData.length > 0) {
      activatingVenues.forEach(activatingVenue => {
        const defaultVenueData = generateDefaultNetworkVenue(activatingVenue.id)

        const alreadyActivatedVenue = networkVenues.find(x => x.venueId === activatingVenue.id)
        if (!alreadyActivatedVenue && !activatingVenue.disabledActivation && !activatingVenue.allApDisabled) {
          const row = tableData.find(v => v.id === activatingVenue.id)
          if (row) {
            row.activated = row.activated || { isActivated: false }
            if (!row.activated.isDisabled) {
              row.activated.isActivated = true
              row.deepVenue = defaultVenueData
              networkVenues.push(row.deepVenue)
            }
          }
        }

        if (activatingVenue.allApDisabled) {
          enabledNotActivatedVenues.push(activatingVenue.name)
        }
      })
    }

    if (enabledNotActivatedVenues.length > 0) {
      showActionModal({
        type: 'info',
        title: 'Your Attention is Required',
        content: (
          <div>
            <div>
              <span>For the following {enabledNotActivatedVenues.length === 1 ? 'venue' : 'venues'},
              the network could not be activated on all Venues: </span> 
            </div>
            {enabledNotActivatedVenues.map(venue =>(<div key={venue}> {venue} </div>))}
          </div>
        )
      })
    }

    return networkVenues
  }

  const deActivateSelected = (venues: any[], activatingVenues: any[]) => {
    const networkVenues = [...venues]
    const selectedVenuesId = activatingVenues.map(row => row.id)

    // Handle current page
    tableData.forEach(row => {
      if (selectedVenuesId.includes(row.id)) {
        row.activated = row.activated || { isActivated: false }
        row.activated.isActivated = false
      }
    })

    if (networkVenues) {
      _.remove(networkVenues, networkVenue => selectedVenuesId.includes(networkVenue['venueId']))
    }

    return networkVenues
  }

  const actions: TableProps<Venue>['actions'] = [
    {
      label: 'Activate',
      onClick: (rows, clearSelection) => {
        const network = networkQuery.data
        const networkVenues = activateSelected(network?.venues || [], rows)
        handleEditNetwork({ ...network, venues: networkVenues }, clearSelection)
      }
    },
    {
      label: 'Deactivate',
      onClick: (rows, clearSelection) => { 
        const network = networkQuery.data
        const networkVenues = deActivateSelected(network?.venues || [], rows)
        handleEditNetwork({ ...network, venues: networkVenues }, clearSelection)
      }
    }
  ]

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
      align: 'center',
      render: function (data) { return data ? data : 0 }
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
      {
        !networkQuery.data?.venues?.length &&  
        <Alert message={notificationMessage} type='info' closable />
      }
      <Table
        rowKey='id'
        actions={actions}
        rowSelection={{
          type: 'checkbox'
        }}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
