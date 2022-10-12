import React, { useEffect, useState } from 'react'

import { Form, Switch }           from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Alert,
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  useAddNetworkVenueMutation,
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useNetworkVenueListQuery,
  useUpdateNetworkMutation
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
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import WifiWidgets       from '../../../../Widgets'
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
    useQuery: useNetworkVenueListQuery,
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })

  const params = useParams()
  const [updateNetwork] = useUpdateNetworkMutation()
  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)
  const networkQuery = useGetNetwork()
  const [
    addNetworkVenue,
    { isLoading: isAddNetworkUpdating }
  ] = useAddNetworkVenueMutation()
  const [
    deleteNetworkVenue,
    { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkVenueMutation()


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
      })
      setTableData(data)
    }
  }, [tableQuery.data, networkQuery.data])

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
    const isWPA3security = row.wlan && row.wlan.wlanSecurity === 'WPA3'
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

  const handleEditNetwork = (network: NetworkSaveData, clearSelection: () => void) => {
    updateNetwork({ params, payload: network }).then(clearSelection)
  }

  const activateSelected = (networkActivatedVenues: NetworkVenue[], activatingVenues: Venue[]) => {
    const enabledNotActivatedVenues:string[] = []
    const networkVenues = [...networkActivatedVenues]
    const network = networkQuery.data
    activatingVenues.forEach(venue => {
      const newNetworkVenue = generateDefaultNetworkVenue(venue.id, (network && network?.id) ? network.id : '')

      const alreadyActivatedVenue = networkVenues.find(x => x.venueId === venue.id)
      if (!alreadyActivatedVenue && !venue.disabledActivation && !venue.allApDisabled) {
        if (!venue.activated.isDisabled) {
          venue.activated.isActivated = true
          venue.deepVenue = newNetworkVenue
          networkVenues.push(newNetworkVenue)
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

  const rowActions: TableProps<Venue>['rowActions'] = [
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
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true
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
      render: function (data) { return data ? data : 0 }
    },
    {
      key: 'aggregatedApStatus',
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
      key: 'activated',
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
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (data, row) {
        return transformVLAN(getCurrentVenue(row), networkQuery.data?.wlan, (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (data, row) {
        return transformAps(getCurrentVenue(row), (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (data, row) {
        return transformRadios(getCurrentVenue(row), (e) => handleClickApGroups(row, e))
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (data, row) {
        return transformScheduling(getCurrentVenue(row), scheduleSlotIndexMap[row.id], (e) => handleClickScheduling(row, e))
      }
    }
  ]

  const handleClickScheduling = (row: Venue, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
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
        rowActions={rowActions}
        rowSelection={{
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
        <WifiWidgets name='networkApGroupDialog'
          {...apGroupModalState}
          tenantId={params.tenantId}
          formName='networkApGroupForm'
          onCancel={handleCancel}
          // onOk={handleOk}
        />
      </Form.Provider>
    </Loader>
  )
}
