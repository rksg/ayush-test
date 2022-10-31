import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showToast, Table, TableProps } from '@acx-ui/components'
import { useVenueRougePolicyQuery }     from '@acx-ui/rc/services'
import {
  RougeAPDetectionActionPayload, RougeAPDetectionActionTypes,
  RougeVenueData,
  useTableQuery, VenueRougePolicyType
} from '@acx-ui/rc/utils'

import RougeAPDetectionContext from '../RougeAPDetectionContext'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

// {
//   "id": "4ca20c8311024ac5956d366f15d96e0c",
//   "name": "leonard-venue",
//   "city": "Toronto, Ontario",
//   "country": "Canada",
//   "aggregatedApStatus": {
//   "1_01_NeverContactedCloud": 491
// },
//   "status": "1_InSetupPhase",
//   "rogueDetection": {
//   "policyId": "14d6ee52df3a48988f91558bac54c1ae",
//     "policyName": "Default profile",
//     "enabled": true
// }
// }

const RougeVenueTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props
  const { state, dispatch } = useContext(RougeAPDetectionContext)

  console.log('rougeVenueTable')
  console.log(state)

  const basicColumns: TableProps<VenueRougePolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aggregatedApStatus',
      key: 'aggregatedApStatus',
      render: (data, row) => {
        if (row.aggregatedApStatus?.hasOwnProperty('2_00_Operational')) {
          return row.aggregatedApStatus['2_00_Operational']
        }
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      key: 'switches',
      render: (data, row) => {
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Rouge AP Detection' }),
      dataIndex: 'rougeDetection',
      key: 'rougeDetection',
      render: (data, row) => {
        console.log(row)
        if (row.rougeDetection?.enabled) {
          return <div style={{ textAlign: 'center' }}>
            <div>ON</div>
            <div>({row.rougeDetection.policyName})</div>
          </div>
        }
        return 'OFF'
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      render: (data, row) => {
        return <Switch checked={
          state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
        }/>
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueRougePolicyQuery,
    defaultPayload
  })

  // useEffect(() => {
  //   if (tableQuery.data && edit) {
  //     console.log('update useeffect here')
  //     // dispatch({
  //     //   type: WifiCallingActionTypes.ADD_NETWORK_ID,
  //     //   payload: {
  //     //     networkIds: tableQuery.data?.data
  //     //       .filter(network => data.networkIds?.includes(network.id))
  //     //       .map(network => network.id),
  //     //     networksName: tableQuery.data?.data
  //     //       .filter(network => data.networkIds?.includes(network.id))
  //     //       .map(network => network.name)
  //     //   }
  //     // } as WifiCallingActionPayload)
  //   }
  // }, [tableQuery.data])

  const basicData = tableQuery.data?.data.map((venue) => {
    return {
      id: venue.id,
      name: venue.name,
      aggregatedApStatus: venue.aggregatedApStatus,
      rougeDetection: venue.rogueDetection,
      activate: false
    }
  })

  const rowActions: TableProps<RougeVenueData>['actions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: RougeVenueData[], clearSelection: () => void) => {
      dispatch({
        type: RougeAPDetectionActionTypes.ADD_VENUES,
        payload: selectRows.map(row => {
          return {
            id: row.id,
            name: row.venue
          }
        })
      } as RougeAPDetectionActionPayload)

      showToast({
        type: 'info',
        content: `Activate ${selectRows.length} venue(s)`
      })
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: RougeVenueData[], clearSelection: () => void) => {
      dispatch({
        type: RougeAPDetectionActionTypes.REMOVE_VENUES,
        payload: selectRows.map(row => {
          return {
            id: row.id,
            name: row.venue
          }
        })
      } as RougeAPDetectionActionPayload)


      showToast({
        type: 'info',
        content: `Deactivate ${selectRows.length} venue(s)`
      })
      clearSelection()
    }
  }] as { label: string, onClick: () => void }[]

  return (
    <Table
      columns={basicColumns}
      dataSource={basicData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox' }}
    />
  )
}

export default RougeVenueTable
