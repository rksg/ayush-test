import { useContext, useEffect } from 'react'

import { Switch }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { showToast, Table, TableProps }                                                      from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useNetworkListQuery }                                from '@acx-ui/rc/services'
import { useTableQuery, WifiCallingActionPayload, WifiCallingActionTypes, WifiCallingScope } from '@acx-ui/rc/utils'

import WifiCallingFormContext from '../WifiCallingFormContext'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'nwSubType',
    'venues',
    'id'
  ]
}

const WifiCallingNetworkTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { edit } = props
  const { state, dispatch } = useContext(WifiCallingFormContext)

  const { data } = useGetWifiCallingServiceQuery({ params: useParams() })

  const basicColumns: TableProps<WifiCallingScope>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'networkName',
      key: 'networkName'
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues'
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate'
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useNetworkListQuery,
    defaultPayload
  })

  useEffect(() => {
    if (data && tableQuery.data && edit) {
      dispatch({
        type: WifiCallingActionTypes.ADD_NETWORK_ID,
        payload: {
          networkIds: tableQuery.data?.data
            .filter(network => data.networkIds?.includes(network.id))
            .map(network => network.id),
          networksName: tableQuery.data?.data
            .filter(network => data.networkIds?.includes(network.id))
            .map(network => network.name)
        }
      } as WifiCallingActionPayload)
    }
  }, [data, tableQuery.data])

  const basicData = tableQuery.data?.data.map((network) => {
    return {
      id: network.id,
      networkName: network.name,
      type: network.nwSubType,
      venues: network.venues.count,
      activate: <Switch checked={state.networkIds.includes(network.id)}/>
    }
  })

  const rowActions: TableProps<WifiCallingScope>['actions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: WifiCallingScope[], clearSelection: () => void) => {
      dispatch({
        type: WifiCallingActionTypes.ADD_NETWORK_ID,
        payload: {
          networkIds: selectRows.map(row => row.id),
          networksName: selectRows.map(row => row.networkName)
        }
      } as WifiCallingActionPayload)

      showToast({
        type: 'info',
        content: $t(
          { defaultMessage: 'Activate {count} network(s)' },
          { count: selectRows.length }
        )
      })
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: WifiCallingScope[], clearSelection: () => void) => {
      dispatch({
        type: WifiCallingActionTypes.DELETE_NETWORK_ID,
        payload: {
          networkIds: selectRows.map(row => row.id)
        }
      } as WifiCallingActionPayload)

      showToast({
        type: 'info',
        content: $t(
          { defaultMessage: 'Deactivate {count} network(s)' },
          { count: selectRows.length }
        )
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

export default WifiCallingNetworkTable
