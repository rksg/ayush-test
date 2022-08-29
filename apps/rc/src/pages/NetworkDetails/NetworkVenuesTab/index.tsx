import React, { useEffect, useState } from 'react'

import { ClockCircleOutlined }     from '@ant-design/icons'
import { Switch, Button, Tooltip } from 'antd'
import _                           from 'lodash'
import { defineMessage, useIntl }  from 'react-intl'

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
  useUpdateNetworkMutation,
  useVenueListQuery
} from '@acx-ui/rc/services'
import {
  Constants,
  useTableQuery,
  getUserSettingsFromDict,
  NetworkSaveData,
  UserSettings,
  RadioEnum,
  NetworkVenue,
  Venue,
  VLAN_PREFIX,
  ISlotIndex,
  getSchedulingCustomTooltip,
  fetchVenueTimeZone,
  getCurrentTimeSlotIndex,
  RadioTypeEnum,
  NetworkVenueScheduler,
  SchedulerTypeEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

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
  const [updateNetwork] = useUpdateNetworkMutation()
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

  const [venueSlotIndexMap, setVenueSlotIndexMap] = useState<Record<string,ISlotIndex>>({})

  useEffect(()=>{
    const updateVenueCurrentSlotIndexMap = async (venueId: string, venueLatitude: string, venueLongitude: string) => {
      const timeZone = await fetchVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      const slotIndex = getCurrentTimeSlotIndex(timeZone)
      setVenueSlotIndexMap(prevSlotIndexMap => ({ ...prevSlotIndexMap, ...{ [venueId]: slotIndex } }))
    }

    if (tableQuery.data && networkQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = networkQuery.data?.venues?.find(
          i => i.venueId === item.id
        )

        if (activatedVenue?.scheduler?.type === SchedulerTypeEnum.CUSTOM) {
          updateVenueCurrentSlotIndexMap(item.id, item.latitude, item.longitude)
        }

        data.push({
          ...item,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })
      setTableData(data)
    }
  }, [tableQuery.data, networkQuery.data])

  const generateDefaultNetworkVenue = (venueId: string): NetworkVenue => {
    const network = networkQuery.data
    return {
      apGroups: [],
      isAllApGroups: true,
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
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
      defaultVenueData.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
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
    updateNetwork({ params, payload: network }).then(clearSelection)
  }

  const activateSelected = (networkActivatedVenues: NetworkVenue[], activatingVenues: Venue[]) => {
    const enabledNotActivatedVenues:string[] = []
    const networkVenues = [...networkActivatedVenues]
    activatingVenues.forEach(venue => {
      const defaultVenueData = generateDefaultNetworkVenue(venue.id)

      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (!alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        if (!venue.activated.isDisabled) {
          venue.activated.isActivated = true
          venue.deepVenue = defaultVenueData
          networkVenues.push(defaultVenueData)
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
      venue.activated.isActivated = false
    })

    _.remove(networkVenues, networkVenue => selectedVenuesId.includes(networkVenue.venueId || ''))

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
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (data, row) {
        return transformVLAN(row)
      }
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: '80px',
      render: function (data, row) {
        return transformAps(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: '140px',
      render: function (data, row) {
        return transformRadios(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (data, row) {
        return transformScheduling(row)
      }
    }
  ]

  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return null
    }

    const network = networkQuery.data
    const venueId = row.id
    let currentVenue = row.deepVenue

    if (!currentVenue) {
      currentVenue = network?.venues?.find(venue => venue.venueId === venueId)
    }

    return currentVenue
  }

  const transformVLAN = (row: Venue) => {
    let currentVenue = getCurrentVenue(row)
    let result = ''

    let valuePrefix = ''
    let vlanString
    let valueSuffix = ''

    if (currentVenue) {
      if (!currentVenue.isAllApGroups && Array.isArray(currentVenue.apGroups) && currentVenue.apGroups.length > 1) {
        vlanString = $t({ defaultMessage: 'Per AP Group' })
      }
      else if (!currentVenue.isAllApGroups && currentVenue?.apGroups?.length === 1) { 
        valueSuffix = $t({ defaultMessage: '(Custom)' })
        const firstApGroup = currentVenue.apGroups[0]

        if (firstApGroup?.vlanPoolId) {
          valuePrefix = VLAN_PREFIX.POOL
          vlanString = firstApGroup.vlanPoolName
        } else if (firstApGroup?.vlanId) {
          valuePrefix = VLAN_PREFIX.VLAN
          vlanString = firstApGroup?.vlanId?.toString()
        }

        if (!vlanString) {
          valuePrefix = VLAN_PREFIX.VLAN
          vlanString = '1' // default fallback to avoid unavailable vlan1 of default ap group
        }
      }
      else {
        valueSuffix = $t({ defaultMessage: '(Default)' })
        const network = networkQuery.data
        const wlan = network?.wlan

        if (wlan?.advancedCustomization?.vlanPool) {
          vlanString = wlan.advancedCustomization.vlanPool.name
          valuePrefix = VLAN_PREFIX.POOL
        } else if (wlan?.vlanId) {
          vlanString = wlan?.vlanId
          valuePrefix = VLAN_PREFIX.VLAN
        }
      }
      result = `${valuePrefix}${vlanString} ${valueSuffix}`
      return <Button type='link'>{result}</Button>
    }
    return result
  }

  const transformAps = (row: Venue) => {
    let currentVenue = getCurrentVenue(row)
    let result = ''

    if (currentVenue) {
      if (currentVenue.isAllApGroups) {
        result = $t({ defaultMessage: 'All APs' })
      } else if (Array.isArray(currentVenue.apGroups)) {
        const firstApGroup = currentVenue.apGroups[0]
        if (currentVenue.apGroups.length > 1) {
          result = `${currentVenue.apGroups.length} ${$t({ defaultMessage: 'AP Groups' })}`
        } else if(firstApGroup?.isDefault) {
          result = $t({ defaultMessage: 'Unassigned APs' })
        } else if(firstApGroup?.apGroupName) {
          result = firstApGroup.apGroupName
        }
      }
      return <Button type='link'>{result}</Button>
    }
    return result
  }

  const transformRadios = (row: Venue) => {
    let currentVenue = getCurrentVenue(row)
    let result = ''
    if (currentVenue) {
      if (currentVenue.isAllApGroups) {
        if (currentVenue.allApGroupsRadioTypes && currentVenue.allApGroupsRadioTypes.length > 0) {
          if (currentVenue.allApGroupsRadioTypes.length === 3) {
            result = $t({ defaultMessage: 'All' })
          } else {
            result = currentVenue.allApGroupsRadioTypes.join(', ').replace(/\-/g, ' ')
          }
        } else {
          if (currentVenue.allApGroupsRadio !== 'Both') {
            result = currentVenue.allApGroupsRadio.replace(/\-/g, ' ')
          } else {
            result = $t({ defaultMessage: '2.4 GHz / 5 GHz' })
          }
        }
      } else if (currentVenue.isAllApGroups !== undefined && Array.isArray(currentVenue.apGroups)) {
        if (currentVenue.apGroups.length === 1) {
          const firstApGroup = currentVenue.apGroups[0]
          if (firstApGroup.radioTypes && firstApGroup.radioTypes.length > 0) {
            if (firstApGroup.radioTypes.length === 3) {
              result = $t({ defaultMessage: 'All' })
            } else {
              result = firstApGroup.radioTypes.join(', ').replace(/\-/g, ' ')
            }
          } else {
            result = firstApGroup.radio !== 'Both' ? firstApGroup.radio.replace(/\-/g, ' ') : $t({ defaultMessage: '2.4 GHz / 5 GHz' })
          }
        } else if (currentVenue.apGroups.length > 1) {
          result = $t({ defaultMessage: 'Per AP Group' })
        }
      }
      return <Button type='link'>{result}</Button>
    }
    return result
  }

  const transformScheduling = (row: Venue) => {
    let currentVenue = getCurrentVenue(row)
    let result = ''
    const scheduler = currentVenue?.scheduler
    const venueId = row.id
    const currentTimeIdx = venueSlotIndexMap[venueId]

    if (currentVenue) {
      let tooltip = ''
      if (scheduler) {
        let message = '', dayName = '', timeString = ''
        switch (scheduler.type) {
          case SchedulerTypeEnum.ALWAYS_ON:
            result = $t({ defaultMessage: '24/7' })
            message = $t({ defaultMessage: 'Network is ON 24/7' })
            break
          case SchedulerTypeEnum.CUSTOM:
            result = $t({ defaultMessage: 'custom' })
            if (currentTimeIdx) {
              const day = currentTimeIdx.day.toLowerCase()
              const time = currentTimeIdx.timeIndex
              const dayData = scheduler[day as keyof NetworkVenueScheduler]
              if (dayData?.charAt(time) === '1') {
                result = $t({ defaultMessage: 'ON now' })
                message = $t({ defaultMessage: 'Scheduled to be on until ' })
              } else {
                result = $t({ defaultMessage: 'OFF now' })
                message = $t({ defaultMessage: 'Currently off. Scheduled to turn on at ' })
              }
              [dayName, timeString] = getSchedulingCustomTooltip(scheduler, currentTimeIdx)
            }
            break
          default:
            break
        }
        tooltip = `${message} ${dayName} ${timeString}`
      } else {
        result = $t({ defaultMessage: '24/7' })
        tooltip = $t({ defaultMessage: 'Network is ON 24/7' })
      }
      return (
        <Tooltip title={tooltip}>
          <Button type='link' onClick={(e) => handleClickScheduling(row, e)}>{result} <ClockCircleOutlined /></Button>
        </Tooltip>
      )
    }
    return result
  }

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
  }

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
