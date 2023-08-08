import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showActionModal, showToast, Table, TableProps } from '@acx-ui/components'
import { useVenueRoguePolicyQuery }                      from '@acx-ui/rc/services'
import {
  RogueAPDetectionActionPayload,
  RogueAPDetectionActionTypes,
  useTableQuery,
  VenueRoguePolicyType
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { VENUE_IN_PROFILE_MAX_COUNT } from '../contentsMap'
import RogueAPDetectionContext        from '../RogueAPDetectionContext'

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

export const RogueVenueTable = () => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(RogueAPDetectionContext)

  const activateVenue = (selectRows: VenueRoguePolicyType[]) => {
    if (selectRows.filter(row =>
      row.hasOwnProperty('rogueDetection') && row.rogueDetection !== undefined
    ).length > 0) {
      showActionModal({
        type: 'warning',
        title: $t({ defaultMessage: 'Change Rogue AP Profile?' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'Only 1 rogue AP profile can be activate at a venue. Are you sure you want to change the rogue AP profile to this venue?' }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'link',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'OK' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: () => {
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
          }]
        }
      })
    } else {
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
      key: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aggregatedApStatus',
      key: 'aggregatedApStatus',
      align: 'center',
      sorter: true,
      render: (_, row) => {
        return Object.values(row.aggregatedApStatus ?? {}).reduce((a, b) => a + b, 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      key: 'switches',
      align: 'center',
      sorter: true,
      render: (_, row) => {
        return row.switches ?? 0
      }
    },
    {
      title: $t({ defaultMessage: 'Rogue AP Detection' }),
      dataIndex: 'rogueDetection',
      key: 'rogueDetection',
      align: 'center',
      sorter: true,
      render: (_, row) => {
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
      render: (_, row) => {
        return <Switch
          data-testid={`switchBtn_${row.id}`}
          checked={
            state.venues
              ? state.venues.findIndex(venueExist => venueExist.id === row.id) !== -1
              : false
          }
          onClick={(_, e) => {
            e.stopPropagation()
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

  const rowActions: TableProps<VenueRoguePolicyType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: VenueRoguePolicyType[], clearSelection: () => void) => {
      if (state.venues.length + selectRows.length >= VENUE_IN_PROFILE_MAX_COUNT) {
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
      rowActions={filterByAccess(rowActions)}
      rowSelection={{ type: 'checkbox' }}
    />
  )
}
