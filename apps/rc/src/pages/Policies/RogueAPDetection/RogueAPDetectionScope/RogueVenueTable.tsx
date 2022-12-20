import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { cssStr, showToast, Table, TableProps } from '@acx-ui/components'
import { useVenueRoguePolicyQuery }             from '@acx-ui/rc/services'
import {
  RogueAPDetectionActionPayload,
  RogueAPDetectionActionTypes,
  useTableQuery,
  VenueRoguePolicyType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

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
  pagination: {
    pageSize: 25
  }
}

const RogueVenueTable = () => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(RogueAPDetectionContext)

  const activateVenue = (selectRows: VenueRoguePolicyType[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.ADD_VENUES,
      payload: selectRows.map(row => {
        return {
          id: row.id,
          name: row.name
        }
      })
    } as RogueAPDetectionActionPayload)
  }

  const deactivateVenue = (selectRows: VenueRoguePolicyType[]) => {
    dispatch({
      type: RogueAPDetectionActionTypes.REMOVE_VENUES,
      payload: selectRows.map(row => {
        return {
          id: row.id,
          name: row.name
        }
      })
    } as RogueAPDetectionActionPayload)
  }

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
      align: 'center',
      render: (data, row) => {
        if (row.aggregatedApStatus?.hasOwnProperty('1_01_NeverContactedCloud')) {
          return <span style={{ color: cssStr('--acx-neutrals-50') }}>
            {row.aggregatedApStatus['1_01_NeverContactedCloud']}
          </span>
        }
        if (row.aggregatedApStatus?.hasOwnProperty('2_00_Operational')) {
          return <TenantLink
            to={`/venues/${row.id}/venue-details/devices`}
          >
            <span style={{ color: cssStr('--acx-semantics-green-50') }}>
              {row.aggregatedApStatus['2_00_Operational']}
            </span>
          </TenantLink>
        }
        return 0
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      key: 'switches',
      align: 'center',
      render: (data, row) => {
        return row.switches ?? 0
      }
    },
    {
      title: $t({ defaultMessage: 'Rogue AP Detection' }),
      dataIndex: 'rogueDetection',
      key: 'rogueDetection',
      align: 'center',
      render: (data, row) => {
        if (row.rogueDetection?.enabled) {
          return <div style={{ textAlign: 'center' }}>
            <div>ON</div>
            <div>({row.rogueDetection.policyName})</div>
          </div>
        }
        return <div style={{ textAlign: 'center' }}>
          OFF
        </div>
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      align: 'center',
      render: (data, row) => {
        return <Switch
          checked={
            state.venues
              ? state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
              : false
          }
          onClick={() => {
            state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
              ? deactivateVenue([row])
              : activateVenue([row])
          }
          }
        />
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueRoguePolicyQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data.map((venue) => {
    return {
      id: venue.id,
      name: venue.name,
      aggregatedApStatus: venue.aggregatedApStatus,
      rogueDetection: venue.rogueDetection,
      activate: false
    }
  })

  const rowActions: TableProps<VenueRoguePolicyType>['actions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: VenueRoguePolicyType[], clearSelection: () => void) => {
      if (state.venues.length + selectRows.length >= 64) {
        showToast({
          type: 'info',
          duration: 10,
          content: 'The max-number of venues in a rogue ap policy profile is 64.'
        })
      } else {
        activateVenue(selectRows)
        clearSelection()
      }
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: VenueRoguePolicyType[], clearSelection: () => void) => {
      deactivateVenue(selectRows)

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
