import { useContext, useEffect } from 'react';

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showToast, Table, TableProps } from '@acx-ui/components'
import { useVenuesListQuery }           from '@acx-ui/rc/services'
import {
  RougeAPDetectionActionPayload, RougeAPDetectionActionTypes,
  RougeVenueData,
  useTableQuery
} from '@acx-ui/rc/utils'

import RougeAPDetectionContext from '../RougeAPDetectionContext'

const defaultPayload = {
  searchString: '',
  fields: [
    'aggregatedApStatus',
    'switches',
    'name',
    'venue',
    'id'
  ]
}

const RougeVenueTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props
  const { state, dispatch } = useContext(RougeAPDetectionContext)

  console.log('rougeVenueTable')
  console.log(state)

  const basicColumns: TableProps<RougeVenueData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venue',
      key: 'venue'
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      dataIndex: 'aps',
      key: 'aps'
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      key: 'switches'
    },
    {
      title: $t({ defaultMessage: 'Rouge AP Detection' }),
      dataIndex: 'rougeDetection',
      key: 'rougeDetection'
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate'
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload
  })

  useEffect(() => {
    if (tableQuery.data && edit) {
      console.log('update useeffect here')
      // dispatch({
      //   type: WifiCallingActionTypes.ADD_NETWORK_ID,
      //   payload: {
      //     networkIds: tableQuery.data?.data
      //       .filter(network => data.networkIds?.includes(network.id))
      //       .map(network => network.id),
      //     networksName: tableQuery.data?.data
      //       .filter(network => data.networkIds?.includes(network.id))
      //       .map(network => network.name)
      //   }
      // } as WifiCallingActionPayload)
    }
  }, [tableQuery.data])

  const basicData = tableQuery.data?.data.map((venue) => {
    return {
      id: venue.id,
      venue: venue.name,
      aps: 0,
      switches: 0,
      rougeDetection: 'OFF',
      activate: <Switch checked={
        state.venues.findIndex(venueExist => venueExist.id === venue.id) !== -1
      }
      key={venue.id}
      />
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
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'checkbox' }}
    />
  )
}

export default RougeVenueTable
