import { useContext, useEffect } from 'react'

import { Switch }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps }                                  from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useNetworkListQuery } from '@acx-ui/rc/services'
import {
  Network, NetworkTypeEnum, networkTypes,
  useTableQuery,
  WifiCallingActionPayload,
  WifiCallingActionTypes
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

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

  const { data } = useGetWifiCallingServiceQuery({ params: useParams() }, {
    skip: !useParams().hasOwnProperty('serviceId')
  })

  const basicColumns: TableProps<Network>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'nwSubType',
      key: 'nwSubType',
      sorter: true,
      render: (data, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: 'Venues' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      render: (data, row) => {
        return row.venues.count
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      render: (data, row) => {
        return <Switch
          checked={state.networkIds.includes(row.id)}
          onClick={(_, e) => {
            e.stopPropagation()
            state.networkIds.includes(row.id)
              ? deactivateNetwork([row])
              : activateNetwork([row])
          }
          }
        />
      }
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

  const basicData = tableQuery.data?.data

  const activateNetwork = (selectRows: Network[]) => {
    dispatch({
      type: WifiCallingActionTypes.ADD_NETWORK_ID,
      payload: {
        networkIds: selectRows.map(row => row.id),
        networksName: selectRows.map(row => row.name)
      }
    } as WifiCallingActionPayload)
  }

  const deactivateNetwork = (selectRows: Network[]) => {
    dispatch({
      type: WifiCallingActionTypes.DELETE_NETWORK_ID,
      payload: {
        networkIds: selectRows.map(row => row.id)
      }
    } as WifiCallingActionPayload)
  }


  const rowActions: TableProps<Network>['rowActions'] = [{
    label: $t({ defaultMessage: 'Activate' }),
    onClick: (selectRows: Network[], clearSelection: () => void) => {
      activateNetwork(selectRows)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    onClick: (selectRows: Network[], clearSelection: () => void) => {
      deactivateNetwork(selectRows)
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
      rowSelection={hasAccess() && { type: 'checkbox' }}
    />
  )
}

export default WifiCallingNetworkTable
