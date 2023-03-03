import { useContext } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showToast, Table, TableProps } from '@acx-ui/components'
import { hasAccesses }                  from '@acx-ui/rbac'
import { useGetVenueSyslogListQuery }   from '@acx-ui/rc/services'
import {
  SyslogActionPayload,
  SyslogActionTypes,
  useTableQuery,
  VenueSyslogPolicyType
} from '@acx-ui/rc/utils'

import SyslogContext from '../SyslogContext'

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

const SyslogVenueTable = () => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(SyslogContext)

  const activateVenue = (selectRows: VenueSyslogPolicyType[]) => {
    dispatch({
      type: SyslogActionTypes.ADD_VENUES,
      payload: selectRows.map(row => {
        return {
          id: row.id,
          name: row.name
        }
      })
    } as SyslogActionPayload)
  }

  const deactivateVenue = (selectRows: VenueSyslogPolicyType[]) => {
    dispatch({
      type: SyslogActionTypes.REMOVE_VENUES,
      payload: selectRows.map(row => {
        return {
          id: row.id,
          name: row.name
        }
      })
    } as SyslogActionPayload)
  }

  const basicColumns: TableProps<VenueSyslogPolicyType>['columns'] = [
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
        return Object.values(row.aggregatedApStatus ?? {}).reduce((a, b) => a + b, 0)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Syslog server' }),
      dataIndex: 'rogueDetection',
      key: 'rogueDetection',
      align: 'center',
      render: (data, row) => {
        if (row.rogueDetection?.enabled) {
          return <div>
            <div>
              {$t({ defaultMessage: 'ON' })}
            </div>
            <div>({row.rogueDetection.policyName})</div>
          </div>
        }
        return <div>
          {$t({ defaultMessage: 'OFF' })}
        </div>
      }
    },
    {
      title: $t({ defaultMessage: 'Activate for Wi-Fi' }),
      dataIndex: 'activate',
      key: 'activate',
      align: 'center',
      render: (data, row) => {
        return <Switch
          data-testid={`switchBtn_${row.id}`}
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
    useQuery: useGetVenueSyslogListQuery,
    defaultPayload
  })

  const basicData = tableQuery.data?.data?.map((venue) => {
    return {
      id: venue.id,
      name: venue.name,
      aggregatedApStatus: venue.aggregatedApStatus,
      rogueDetection: venue.rogueDetection,
      activate: false
    }
  })

  const rowActions: TableProps<VenueSyslogPolicyType>['rowActions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: VenueSyslogPolicyType[], clearSelection: () => void) => {
      if (state.venues.length + selectRows.length >= 64) {
        showToast({
          type: 'info',
          duration: 10,
          content: $t({ defaultMessage:
            'The max-number of venues in a rogue ap policy profile is 64.' })
        })
      } else {
        activateVenue(selectRows)
        clearSelection()
      }
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: VenueSyslogPolicyType[], clearSelection: () => void) => {
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
      rowActions={hasAccesses(rowActions)}
      rowSelection={{ type: 'checkbox' }}
    />
  )
}

export default SyslogVenueTable
