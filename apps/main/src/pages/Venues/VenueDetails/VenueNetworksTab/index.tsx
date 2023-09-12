/* eslint-disable max-len */
import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import {
  Loader,
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
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useVenueNetworkListQuery,
  useVenueDetailsHeaderQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  NetworkType,
  NetworkTypeEnum,
  RadioTypeEnum,
  generateDefaultNetworkVenue,
  useScheduleSlotIndexMap,
  aggregateApGroupPayload,
  Network,
  NetworkSaveData,
  NetworkVenue,
  IsSecuritySupport6g
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                    from '@acx-ui/user'

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
    'check-all',
    'name',
    'description',
    'nwSubType',
    'venues',
    'aps',
    'clients',
    'vlan',
    'cog',
    'ssid',
    'vlanPool',
    'captiveType',
    'id',
    'isOweMaster',
    'owePairNetworkId',
    'dsaeOnboardNetwork'
  ]
}

interface NetworkExtended extends Network {
  deepVenue?: NetworkVenue,
  latitude?: string,
  longitude?: string
}

export interface SchedulingModalState {
  visible: boolean,
  networkVenue?: NetworkVenue,
  network?: { name: string } | null,
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
}

const defaultArray: NetworkExtended[] = []


interface schedule {
  [key: string]: string
}

export function VenueNetworksTab () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useVenueNetworkListQuery,
    defaultPayload
  })
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)
  const [tableData, setTableData] = useState(defaultArray)
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })
  const [scheduleModalState, setScheduleModalState] = useState<SchedulingModalState>({
    visible: false
  })

  const params = useParams()
  const navigate = useNavigate()
  const venueDetailsQuery = useVenueDetailsHeaderQuery({ params })
  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])

  const [
    addNetworkVenue,
    { isLoading: isAddNetworkUpdating }
  ] = useAddNetworkVenueMutation()
  const [
    deleteNetworkVenue,
    { isLoading: isDeleteNetworkUpdating }
  ] = useDeleteNetworkVenueMutation()

  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<NetworkExtended[]> = []
      // showing onboarded networks
      const _rows: string[]=[]

      tableQuery.data.data.forEach(item => {
        const activatedVenue = getCurrentVenue(item)
        if (item?.children) {
          _rows.push(item.id)
        }
        setExpandedRowKeys(_rows)

        data.push({
          ...item,
          deepVenue: activatedVenue,
          latitude: venueDetailsQuery.data?.venue.latitude,
          longitude: venueDetailsQuery.data?.venue.longitude
        })
      })
      setTableData(data)
    }
  }, [tableQuery.data, venueDetailsQuery.data])

  const scheduleSlotIndexMap = useScheduleSlotIndexMap(tableData)
  const linkToAddNetwork = useTenantLink('/networks/wireless/add')

  const activateNetwork = async (checked: boolean, row: Network) => {
    if (row.allApDisabled) {
      // TODO:
      // manageAPGroups(row);
    }
    else {
      if (row.deepNetwork) {
        if (checked) { // activate
          const newNetworkVenue = generateDefaultNetworkVenue(params.venueId as string, row.id)
          if (triBandRadioFeatureFlag && IsSecuritySupport6g(row.deepNetwork.wlan?.wlanSecurity)) {
            newNetworkVenue.allApGroupsRadioTypes.push(RadioTypeEnum._6_GHz)
          }
          addNetworkVenue({ params: { tenantId: params.tenantId }, payload: newNetworkVenue })
        } else { // deactivate
          row.deepNetwork.venues.forEach((networkVenue) => {
            if (networkVenue.venueId === params.venueId) {
              deleteNetworkVenue({
                params: {
                  tenantId: params.tenantId, networkVenueId: networkVenue.id
                }
              })
            }
          })
        }
      }
    }
  }

  const getCurrentVenue = (row: Network) => {
    if (!row.activated.isActivated) {
      return
    }
    const deepNetworkVenues = row.deepNetwork?.venues || []
    return deepNetworkVenues.find(v => v.venueId === params.venueId)
  }

  const isSystemCreatedNetwork = (row: Network) => {
    return supportOweTransition && row?.isOweMaster === false
  }

  // TODO: Waiting for API support
  // const actions: TableProps<Network>['actions'] = [
  //   {
  //     label: $t({ defaultMessage: 'Activate' }),
  //     onClick: () => {
  //     }
  //   },
  //   {
  //     label: $t({ defaultMessage: 'Deactivate' }),
  //     onClick: () => {
  //     }
  //   }
  // ]

  const actions: TableProps<Network>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Network' }),
      onClick: () => {
        navigate(`${linkToAddNetwork.pathname}`)
      }
    }
  ]

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (_, row) {
        return (!!row?.isOnBoarded ?
          <span>{row.name}</span>
          : <TenantLink to={`/networks/wireless/${row.id}/network-details/overview`}>{row.name}</TenantLink>
        )
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (_, row) => <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    },
    // { // TODO: Waiting for HEALTH feature support
    //   key: 'health',
    //   title: $t({ defaultMessage: 'Health' }),
    //   dataIndex: 'health'
    // },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      sorter: true,
      render: function (__, row) {
        let disabled = false
        // eslint-disable-next-line max-len
        let title = $t({ defaultMessage: 'You cannot activate the DHCP Network on this venue because it already enabled mesh setting' })
        if((_.get(row,'deepNetwork.enableDhcp') && _.get(venueDetailsQuery.data,'venue.mesh.enabled'))){
          disabled = true
        } else if (row?.isOnBoarded) {
          disabled = true
          title = $t({ defaultMessage: 'This is a Onboarding network for WPA3-DSAE for DPSK, so its activation on this venue is tied to the Service network exclusively.' })
        }else if (isSystemCreatedNetwork(row)) {
          disabled = true
          title = $t({ defaultMessage: 'Activating the OWE network also enables the read-only OWE transition network.' })
        }else{
          title = ''
        }
        return <Tooltip
          title={title}
          placement='bottom'><Switch
            checked={Boolean(row.activated?.isActivated)}
            disabled={disabled}
            onClick={(checked, event) => {
              activateNetwork(checked, row)
              event.stopPropagation()
            }}
          /></Tooltip>
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlan',
      render: function (_, row) {
        return transformVLAN(getCurrentVenue(row), row.deepNetwork, (e) => handleClickApGroups(row, e), isSystemCreatedNetwork(row) || !!row?.isOnBoarded)
      }
    },
    {
      key: 'aps',
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      width: 80,
      render: function (_, row) {
        return transformAps(getCurrentVenue(row), row.deepNetwork, (e) => handleClickApGroups(row, e), isSystemCreatedNetwork(row) || !!row?.isOnBoarded)
      }
    },
    {
      key: 'radios',
      title: $t({ defaultMessage: 'Radios' }),
      dataIndex: 'radios',
      width: 140,
      render: function (_, row) {
        return transformRadios(getCurrentVenue(row), row.deepNetwork, (e) => handleClickApGroups(row, e), isSystemCreatedNetwork(row) || !!row?.isOnBoarded)
      }
    },
    {
      key: 'scheduling',
      title: $t({ defaultMessage: 'Scheduling' }),
      dataIndex: 'scheduling',
      render: function (_, row) {
        return transformScheduling(getCurrentVenue(row), scheduleSlotIndexMap[row.id], (e) => handleClickScheduling(row, e), isSystemCreatedNetwork(row) || !!row?.isOnBoarded)
      }
    }
  ]

  const handleClickScheduling = (row: Network, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setScheduleModalState({
      visible: true,
      network: row,
      venue: venueDetailsQuery?.data?.venue,
      networkVenue: getCurrentVenue(row)
    })
  }

  const handleClickApGroups = (row: Network, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setApGroupModalState({
      visible: true,
      venueName: row.name,
      wlan: row.deepNetwork?.wlan,
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
      { isLoading: false, isFetching: isAddNetworkUpdating },
      { isLoading: false, isFetching: isDeleteNetworkUpdating }
    ]}>
      <Table
        settingsId='venue-networks-table'
        rowKey='id'
        actions={filterByAccess(actions)}
        // rowSelection={{
        //   type: 'checkbox'
        // }}
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        expandedRowKeys={expandedRowKeys}
        expandIconColumnIndex={-1}
        expandIcon={
          () => <></>
        }
      />
      <Form.Provider
        onFormFinish={handleFormFinish}
      >
        <NetworkApGroupDialog
          {...apGroupModalState}
          formName='networkApGroupForm'
          tenantId={params.tenantId}
          onCancel={handleCancel}
          // onOk={handleOk}
        />
      </Form.Provider>
      <Form.Provider
        onFormFinish={handleScheduleFormFinish}
      >
        <NetworkVenueScheduleDialog
          {...scheduleModalState}
          formName='networkVenueScheduleForm'
          onCancel={handleCancel}
        />
      </Form.Provider>
    </Loader>
  )
}
