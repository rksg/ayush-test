import { useContext, useEffect } from 'react'

import { Switch }    from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Table, TableProps, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  useGetNetworkTemplateListQuery,
  useGetWifiCallingServiceQuery,
  useGetWifiCallingServiceTemplateQuery,
  useNetworkListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  ConfigTemplateType,
  Network, NetworkTypeEnum, networkTypes, useConfigTemplate, useConfigTemplateQueryFnSwitcher,
  useTableQuery,
  WifiCallingActionPayload,
  WifiCallingActionTypes, WifiNetwork
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { useEnforcedStatus }  from '../../../configTemplates'
import WifiCallingFormContext from '../WifiCallingFormContext'

const defaultPayload = {
  searchString: '',
  fields: ['name', 'nwSubType', 'venues', 'id', 'venueApGroups', 'isEnforced']
}

const WifiCallingNetworkTable = (props: { edit?: boolean }) => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()

  const enableWifiRbac = useIsSplitOn(Features.WIFI_RBAC_API)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const { edit } = props
  const { state, dispatch } = useContext(WifiCallingFormContext)
  const { hasEnforcedItem, getEnforcedActionMsg } = useEnforcedStatus(ConfigTemplateType.NETWORK)

  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetWifiCallingServiceQuery,
    useTemplateQueryFn: useGetWifiCallingServiceTemplateQuery,
    skip: !useParams().hasOwnProperty('serviceId'),
    enableRbac: enableServicePolicyRbac
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
      render: (_, row) => {
        return $t(networkTypes[row.nwSubType as NetworkTypeEnum])
      }
    },
    {
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      dataIndex: 'venues',
      key: 'venues',
      sorter: true,
      render: (_, row) => {
        return (enableWifiRbac || enableTemplateRbac)
          ? (row as WifiNetwork).venueApGroups.length
          : row.venues.count
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      dataIndex: 'activate',
      key: 'activate',
      render: (_, row) => {
        const isEnforcedByTemplate = hasEnforcedItem([row])
        const enforcedActionMsg = getEnforcedActionMsg([row])

        return <Tooltip
          title={enforcedActionMsg}
          placement='bottom'>
          <Switch
            checked={state.networkIds.includes(row.id)}
            disabled={isEnforcedByTemplate}
            onClick={(_, e) => {
              e.stopPropagation()
              state.networkIds.includes(row.id)
                ? deactivateNetwork([row])
                : activateNetwork([row])
            }
            }
          />
        </Tooltip>
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetNetworkTemplateListQuery :
      enableWifiRbac? useWifiNetworkListQuery : useNetworkListQuery,
    defaultPayload,
    enableRbac: isTemplate ? enableTemplateRbac : enableWifiRbac
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
    disabled: (selectedRows: Network[]) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows: Network[]) => getEnforcedActionMsg(selectedRows),
    onClick: (selectRows: Network[], clearSelection: () => void) => {
      activateNetwork(selectRows)
      clearSelection()
    }
  },{
    label: $t({ defaultMessage: 'Deactivate' }),
    disabled: (selectedRows: Network[]) => hasEnforcedItem(selectedRows),
    tooltip: (selectedRows: Network[]) => getEnforcedActionMsg(selectedRows),
    onClick: (selectRows: Network[], clearSelection: () => void) => {
      deactivateNetwork(selectRows)
      clearSelection()
    }
  }]

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
