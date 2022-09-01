import { useEffect, useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  useAddNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useVenueNetworkListQuery
} from '@acx-ui/rc/services'
import { useTableQuery, NetworkType, NetworkTypeEnum, RadioTypeEnum, WlanSecurityEnum, generateDefaultNetworkVenue, Network } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                     from '@acx-ui/react-router-dom'

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

const defaultArray: Network[] = []

export function VenueNetworksTab () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useVenueNetworkListQuery,
    defaultPayload
  })
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)
  const [tableData, setTableData] = useState(defaultArray)
  const params = useParams()

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
      setTableData(tableQuery.data.data)
    }
  }, [tableQuery.data])

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
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      sorter: true,
      render: (data: unknown, row) => <NetworkType
        networkType={data as NetworkTypeEnum}
        row={row}
      />
    },
    {
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'health'
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
      width: '80px',
      render: function (data, row) {
        return row.activated.isActivated ? 'All APs' : ''
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
    </Loader>
  )
}
