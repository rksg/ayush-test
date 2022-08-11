import React, { useEffect, useState } from 'react'

import { Switch }                 from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

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
import { Constants, useTableQuery, getUserSettingsFromDict, NetworkSaveData, NetworkVenue } from '@acx-ui/rc/utils'
import { useParams }                                                                        from '@acx-ui/react-router-dom'

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
const notificationMessage = defineMessage({
  defaultMessage: 'No venues activating this network. Use the ON/OFF switches in the list to select the activating venues'
})

export function NetworkVenuesTab () {
  const { $t } = useIntl()
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

    let deactivateNetworkVenueId
    if (!checked && network?.venues) {
      network?.venues.forEach((venue: NetworkVenue) => {
        if (venue.venueId === row.id || venue.id === row.id) {
          deactivateNetworkVenueId = venue.id || ''
        }
      })
    }
    if (!row.allApDisabled || !checked) {
      if (checked) { // activate
        addNetworkVenue({ params: { tenantId: params.tenantId }, payload: defaultVenueData })
      } else { // deactivate
        deleteNetworkVenue({
          params: {
            tenantId: params.tenantId, networkVenueId: deactivateNetworkVenueId
          }
        })
      }
    }
  }

  const handleEditNetwork = (network: NetworkSaveData, clearSelection: () => void) => {
    updateNetworkDeep({ params, payload: network }).then(clearSelection)
  }

  const activateSelected = (networkActivatedVenues: NetworkVenue[], activatingVenues: Venue[]) => {
    const enabledNotActivatedVenues:string[] = []
    const networkVenues = [...networkActivatedVenues]
    activatingVenues.forEach(venue => {
      const defaultVenueData = generateDefaultNetworkVenue(venue.id)

      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (!alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        venue.activated = venue.activated || { isActivated: false }
        if (!venue.activated.isDisabled) {
          venue.activated.isActivated = true
          venue.deepVenue = defaultVenueData
          networkVenues.push(venue.deepVenue)
        }
      }

      if (venue.allApDisabled) {
        enabledNotActivatedVenues.push(venue.name)
      }
    })

    if (enabledNotActivatedVenues.length > 0) {
      showActionModal({
        type: 'info',
        title: $t({ defaultMessage: 'Your Attention is Required' }),
        content: (<>
          <div>
            {$t(
              { defaultMessage: 'For the following {count, plural, one {venue} other {venues}}, the network could not be activated on all Venues:' },
              { count: enabledNotActivatedVenues.length }
            )}
          </div>
          {enabledNotActivatedVenues.map(venue =>(<div key={venue}> {venue} </div>))}
        </>)
      })
    }

    return networkVenues
  }

  const deActivateSelected = (networkActivatedVenues: NetworkVenue[], activatingVenues: Venue[]) => {
    const networkVenues = [...networkActivatedVenues]
    const selectedVenuesId = activatingVenues.map(row => row.id)

    // Handle toogle button
    activatingVenues.forEach(venue => {
      venue.activated = venue.activated || { isActivated: false }
      venue.activated.isActivated = false
    })

    if (networkVenues) {
      _.remove(networkVenues, networkVenue => selectedVenuesId.includes(networkVenue['venueId']))
    }

    return networkVenues
  }

  const actions: TableProps<Venue>['actions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: (rows, clearSelection) => {
        const network = networkQuery.data
        const networkVenues = activateSelected(network?.venues || [], rows)
        handleEditNetwork({ ...network, venues: networkVenues }, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: (rows, clearSelection) => {
        const network = networkQuery.data
        const networkVenues = deActivateSelected(network?.venues || [], rows)
        handleEditNetwork({ ...network, venues: networkVenues }, clearSelection)
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count'],
      align: 'center',
      render: function (data) { return data ? data : 0 }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
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
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked, event) => {
            activateNetwork(checked, row)
            event.stopPropagation()
          }}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: '80px',
      render: function (data, row) {
        return row.activated.isActivated ? 'All APs' : ''
      }
    },
    {
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: '140px',
      render: function (data, row) {
        return row.activated.isActivated ? '2.4 GHz / 5 GHz' : ''
      }
    },
    {
      title: $t({ defaultMessage: 'Scheduling' }),
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
        <Alert message={$t(notificationMessage)} type='info' showIcon closable />
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
