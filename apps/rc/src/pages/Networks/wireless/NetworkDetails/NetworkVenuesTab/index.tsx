import React, { useEffect, useState } from 'react'

import { Form, Switch }           from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Alert,
  Loader,
  showActionModal,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  NetworkApGroupDialog,
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling,
  NetworkVenueScheduleDialog
} from '@acx-ui/rc/components'
import {
  useAddNetworkVenueMutation,
  useAddNetworkVenuesMutation,
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useDeleteNetworkVenuesMutation,
  useNetworkVenueListQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  NetworkSaveData,
  NetworkVenue,
  Venue,
  generateDefaultNetworkVenue,
  useScheduleSlotIndexMap,
  aggregateApGroupPayload,
  RadioTypeEnum,
  SchedulingModalState,
  IsWPA3Security
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { useGetNetwork } from '../services'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'

interface ApGroupModalState { // subset of ApGroupModalWidgetProps
  visible: boolean,
  wlan?: NetworkSaveData['wlan'],
  networkVenue?: NetworkVenue,
  venueName?: string
}

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
    'status',
    'isOweMaster',
    'owePairNetworkId'
  ]
}

const defaultArray: Venue[] = []
/* eslint-disable max-len */
const notificationMessage = defineMessage({
  defaultMessage: 'No venues activating this network. Use the ON/OFF switches in the list to select the activating venues'
})

interface schedule {
  [key: string]: string
}

export function NetworkVenuesTab () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })
  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })
  const [systemNetwork, setSystemNetwork] = useState(false)

  const params = useParams()
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)

  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()

  const networkQuery = useGetNetwork()
  const [
    addNetworkVenue,
    { isLoading: isAddNetworkUpdating }
  ] = useAddNetworkVenueMutation()
  const [
    deleteNetworkVenue,
    { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkVenueMutation()

  const [addNetworkVenues] = useAddNetworkVenuesMutation()
  const [deleteNetworkVenues] = useDeleteNetworkVenuesMutation()


  const getCurrentVenue = (row: Venue) => {
    if (!row.activated.isActivated) {
      return
    }
    const network = networkQuery.data
    const venueId = row.id
    let venue = row.deepVenue
    if (!venue) {
      venue = network?.venues?.find(v => v.venueId === venueId)
    }
    return venue
  }

  useEffect(()=>{
    if (tableQuery.data && networkQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = item.deepVenue || networkQuery.data?.venues?.find(
          i => i.venueId === item.id
        )
        data.push({
          ...item,
          deepVenue: activatedVenue,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
        if (supportOweTransition) {
          setSystemNetwork(networkQuery.data?.isOweMaster === false && 'owePairNetworkId' in networkQuery.data)
        }
      })
      setTableData(data)
    }
  }, [tableQuery.data, networkQuery.data, supportOweTransition])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData)

  const activateNetwork = async (checked: boolean, row: Venue) => {
    // TODO: Service
    // if (checked) {
    //   if (row.allApDisabled) {
    //     manageAPGroups(row);
    //   }
    // }
    const network = networkQuery.data
    const newNetworkVenue = generateDefaultNetworkVenue(row.id, (network && network?.id) ? network.id : '')
    const isWPA3security = IsWPA3Security(network?.wlan?.wlanSecurity)
    if (triBandRadioFeatureFlag && isWPA3security) {
      newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
    }

    let deactivateNetworkVenueId = ''
    if (!checked && network?.venues) {
      network?.venues.forEach((venue: NetworkVenue) => {
        if (venue.venueId === row.id || venue.id === row.id) {
          deactivateNetworkVenueId = venue.id ? venue.id : row.id
        }
      })
    }
    if (!row.allApDisabled || !checked) {
      if (checked) { // activate
        addNetworkVenue({ params: { tenantId: params.tenantId }, payload: newNetworkVenue })
      } else { // deactivate
        deleteNetworkVenue({
          params: {
            tenantId: params.tenantId, networkVenueId: deactivateNetworkVenueId
          }
        })
      }
    }
  }

  const handleAddNetworkVenues = (networkVenues: NetworkVenue[], clearSelection: () => void) => {
    if (networkVenues.length > 0) {
      addNetworkVenues({ payload: networkVenues }).then(clearSelection)
    } else {
      clearSelection()
    }
  }

  const handleDeleteNetworkVenues = (networkVenueIds: string[], clearSelection: () => void) => {
    if (networkVenueIds.length > 0) {
      deleteNetworkVenues({ payload: networkVenueIds }).then(clearSelection)
    } else {
      clearSelection()
    }
  }

  const activateSelected = (activatingVenues: Venue[]) => {
    const enabledNotActivatedVenueNames: string[] = []
    const network = networkQuery.data
    const networkVenues = network?.venues || []
    const newActivatedVenues: NetworkVenue[] = []

    activatingVenues.forEach(venue => {
      const newNetworkVenue = generateDefaultNetworkVenue(venue.id, (network && network?.id) ? network.id : '')
      const isWPA3security = IsWPA3Security(network?.wlan?.wlanSecurity)
      if (triBandRadioFeatureFlag && isWPA3security) {
        newNetworkVenue.allApGroupsRadioTypes?.push(RadioTypeEnum._6_GHz)
      }
      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (!alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        if (!venue.activated.isDisabled && !venue.activated.isActivated) {
          newActivatedVenues.push(newNetworkVenue)
        }
      }

      if (venue.allApDisabled) {
        enabledNotActivatedVenueNames.push(venue.name)
      }
    })

    if (enabledNotActivatedVenueNames.length > 0) {
      showActionModal({
        type: 'info',
        title: $t({ defaultMessage: 'Your Attention is Required' }),
        content: (<>
          <div>
            {$t(
              { defaultMessage: 'For the following {count, plural, one {venue} other {venues}}, the network could not be activated on all Venues:' },
              { count: enabledNotActivatedVenueNames.length }
            )}
          </div>
          {enabledNotActivatedVenueNames.map(venue =>(<div key={venue}> {venue} </div>))}
        </>)
      })
    }

    return newActivatedVenues
  }

  const deActivateSelected = (deActivatingVenues: Venue[]) => {
    const network = networkQuery.data
    const networkVenues = network?.venues || []
    const selectedVenuesIds: string[] = []

    deActivatingVenues.forEach(venue => {
      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        const { id } = alreadyActivatedVenue
        if (!venue.activated.isDisabled && id && venue.activated.isActivated === true) {
          selectedVenuesIds.push(id)
        }
      }
    })

    return selectedVenuesIds
  }

  const activation = (selectedRows:Venue[]) => {
    const enabled = selectedRows.some((item)=>{
      return item.mesh && item.mesh.enabled && networkQuery.data && networkQuery.data.enableDhcp
    })
    return !enabled
  }
  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      visible: activation,
      onClick: (rows, clearSelection) => {
        const networkVenues = activateSelected(rows)
        handleAddNetworkVenues(networkVenues, clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      visible: activation,
      onClick: (rows, clearSelection) => {
        const deActivateNetworkVenueIds = deActivateSelected(rows)
        handleDeleteNetworkVenues(deActivateNetworkVenueIds, clearSelection)
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left'
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'networks',
      title: $t({ defaultMessage: 'Networks' }),
      dataIndex: ['networks', 'count'],
      align: 'center',
      render: function (_, { networks }) { return networks?.count ? networks?.count : 0 }
    },
    {
      key: 'aggregatedApStatus',
      title: $t({ defaultMessage: 'Wi-Fi APs' }),
      dataIndex: 'aggregatedApStatus',
      align: 'center',
      render: function (_, row) {
        if (!row.aggregatedApStatus) { return 0 }
        return Object
          .values(row.aggregatedApStatus)
          .reduce((a, b) => a + b, 0)
      }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (_, row) {
        let disabled = false
        // eslint-disable-next-line max-len
        let title = $t({ defaultMessage: 'You cannot activate the DHCP service on this venue because it already enabled mesh setting' })
        if((networkQuery.data && networkQuery.data.enableDhcp && row.mesh && row.mesh.enabled) || systemNetwork){
          disabled = true
        }else{
          title = ''
        }
        return <Tooltip
          title={title}
          placement='bottom'>
          <Switch
            checked={Boolean(row.activated?.isActivated)}
            disabled={disabled}
            onClick={(checked, event) => {
              activateNetwork(checked, row)
              event.stopPropagation()
            }}
          />
        </Tooltip>
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        return transformVLAN(getCurrentVenue(row), networkQuery.data as NetworkSaveData, (e) => handleClickApGroups(row, e), systemNetwork)
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        return transformAps(getCurrentVenue(row), networkQuery.data as NetworkSaveData, (e) => handleClickApGroups(row, e), systemNetwork)
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformRadios(getCurrentVenue(row), networkQuery.data as NetworkSaveData, (e) => handleClickApGroups(row, e), systemNetwork)
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        return transformScheduling(getCurrentVenue(row), scheduleSlotIndexMap[row.id], (e) => handleClickScheduling(row, e), systemNetwork)
      }
    }
  ]

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      venue: row,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      wlan: networkQuery.data?.wlan,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleCancel = () => {
    setApGroupModalState({
      visible: false
    })
    setScheduleModalState({
      visible: false
    })
  }


  const handleFormFinish = (name: string, newData: FormFinishInfo) => {
    if (name === 'networkApGroupForm') {
      let oldData = _.cloneDeep(apGroupModalState.networkVenue)
      const payload = aggregateApGroupPayload(newData, oldData)

      updateNetworkVenue({ params: {
        tenantId: params.tenantId,
        networkVenueId: payload.id
      }, payload: payload }).then(()=>{
        setApGroupModalState({
          visible: false
        })
      })
    }
  }

  const handleScheduleFormFinish = (name: string, info: FormFinishInfo) => {
    let data = _.cloneDeep(scheduleModalState.networkVenue)
    // const schdule = info.values.map

    let tmpScheduleList: schedule = { type: info.values?.scheduler.type }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: { [key: string]: any } = info.values?.scheduler
    for (let key in map) {
      if(key === 'type'){
        continue
      }
      if (map.hasOwnProperty(key) && map['type'] === 'CUSTOM') {
        let scheduleList: string[] = []
        for(let i = 0; i < 96; i++){
          scheduleList.push('0')
        }
        map[key].map((item: string) => {
          const value = parseInt(item.split('_')[1], 10)
          scheduleList[value] = '1'
        })
        tmpScheduleList[key] = scheduleList.join('')
      }
    }

    const payload = _.assign(data, { scheduler: tmpScheduleList })

    updateNetworkVenue({ params: {
      tenantId: params.tenantId,
      networkVenueId: payload.id
    }, payload: payload }).then(()=>{
      setScheduleModalState({
        visible: false
      })
    })
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
        settingsId='network-venues-table'
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && !systemNetwork && {
          type: 'checkbox'
        }}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
      <Form.Provider
        onFormFinish={handleFormFinish}
      >
        <NetworkApGroupDialog
          {...apGroupModalState}
          tenantId={params.tenantId}
          formName='networkApGroupForm'
          onCancel={handleCancel}
        />
      </Form.Provider>
      <Form.Provider
        onFormFinish={handleScheduleFormFinish}
      >
        <NetworkVenueScheduleDialog
          {...scheduleModalState}
          formName='networkVenueScheduleForm'
          network={networkQuery.data}
          onCancel={handleCancel}
        />
      </Form.Provider>
    </Loader>
  )
}
