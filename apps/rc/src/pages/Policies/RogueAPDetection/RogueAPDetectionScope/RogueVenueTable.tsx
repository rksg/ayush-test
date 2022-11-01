import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showToast, Table, TableProps } from '@acx-ui/components'
import { useVenueRoguePolicyQuery }     from '@acx-ui/rc/services'
import {
  RogueAPDetectionActionPayload, RogueAPDetectionActionTypes,
  RogueVenueData,
  useTableQuery, VenueRoguePolicyType
} from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'switches',
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

const RogueVenueTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props
  const { state, dispatch } = useContext(RogueAPDetectionContext)

  const basicColumns: TableProps<VenueRoguePolicyType>['columns'] = [
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
        return row.switches ?? 0
      }
    },
    {
      title: $t({ defaultMessage: 'Rogue AP Detection' }),
      dataIndex: 'rogueDetection',
      key: 'rogueDetection',
      render: (data, row) => {
        if (row.rogueDetection?.enabled) {
          return <div style={{ textAlign: 'center' }}>
            <div>ON</div>
            <div>({row.rogueDetection.policyName})</div>
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
    useQuery: useVenueRoguePolicyQuery,
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
      rogueDetection: venue.rogueDetection,
      activate: false
    }
  })

  const rowActions: TableProps<RogueVenueData>['actions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: RogueVenueData[], clearSelection: () => void) => {
      dispatch({
        type: RogueAPDetectionActionTypes.ADD_VENUES,
        payload: selectRows.map(row => {
          return {
            id: row.id,
            name: row.venue
          }
        })
      } as RogueAPDetectionActionPayload)

      showToast({
        type: 'info',
        content: `Activate ${selectRows.length} venue(s)`
      })
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: RogueVenueData[], clearSelection: () => void) => {
      dispatch({
        type: RogueAPDetectionActionTypes.REMOVE_VENUES,
        payload: selectRows.map(row => {
          return {
            id: row.id,
            name: row.venue
          }
        })
      } as RogueAPDetectionActionPayload)


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

export default RogueVenueTable
