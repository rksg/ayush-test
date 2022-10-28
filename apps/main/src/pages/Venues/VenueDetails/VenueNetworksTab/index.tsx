/* eslint-disable max-len */
import React, { useEffect, useState } from 'react'

import { Form, Switch } from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
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
  WlanSecurityEnum,
  generateDefaultNetworkVenue,
  useScheduleSlotIndexMap,
  aggregateApGroupPayload,
  Network,
  NetworkSaveData,
  NetworkVenue,
  ApGroupModalWidgetProps,
  transformVLAN,
  transformAps,
  transformRadios,
  transformScheduling
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import type { FormFinishInfo } from 'rc-field-form/es/FormContext'


type LazyComponentType = React.LazyExoticComponent<React.ComponentType<ApGroupModalWidgetProps>>
const WifiWidgets: LazyComponentType = React.lazy(() => import('rc/Widgets'))

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
    'id'
  ]
}

interface NetworkExtended extends Network {
  deepVenue?: NetworkVenue,
  latitude?: string,
  longitude?: string
}

const getCurrentVenue = (row: Network) => {
  if (!row.activated.isActivated) {
    return
  }
  const networkId = row.id
  const deepNetworkVenues = row.deepNetwork?.venues || []
  return deepNetworkVenues.find(v => v.networkId === networkId)
}

const defaultArray: NetworkExtended[] = []

export function VenueNetworksTab () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useVenueNetworkListQuery,
    defaultPayload
  })
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)

  const [tableData, setTableData] = useState(defaultArray)
  const [apGroupModalState, setApGroupModalState] = useState<ApGroupModalState>({
    visible: false
  })

  const params = useParams()
  const venueDetailsQuery = useVenueDetailsHeaderQuery({ params })
  const [updateNetworkVenue] = useUpdateNetworkVenueMutation()

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
      tableQuery.data.data.forEach(item => {
        const activatedVenue = getCurrentVenue(item)
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

  const activateNetwork = async (checked: boolean, row: Network) => {
    if (row.allApDisabled) {
      // TODO:
      // manageAPGroups(row);
    }
    else {
      if (row.deepNetwork) {
        if (checked) { // activate
          const newNetworkVenue = generateDefaultNetworkVenue(params.venueId as string, row.id)
          if (triBandRadioFeatureFlag && row.deepNetwork.wlan &&
              row.deepNetwork.wlan.wlanSecurity === WlanSecurityEnum.WPA3) {
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

  const columns: TableProps<Network>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
        )
      }
    },
    {
      key: 'nwSubType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      key: 'health',
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'health'
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
      width: 80,
      render: function (data, row) {
        return transformVLAN(getCurrentVenue(row), row.deepNetwork?.wlan, (e) => handleClickApGroups(row, e))
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

  const handleClickScheduling = (row: Network, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
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
      {/* <Row justify='end'> TODO:
        <Button type='link'>{$t({ defaultMessage: 'Add Network' })}</Button>
      </Row> */}
      <Table
        rowKey='id'
        // actions={actions}  TODO: Waiting for API support
        // rowSelection={{
        //   type: 'checkbox'
        // }}
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
          formName='networkApGroupForm'
          tenantId={params.tenantId}
          onCancel={handleCancel}
          // onOk={handleOk}
        />
      </Form.Provider>
    </Loader>
  )
}
