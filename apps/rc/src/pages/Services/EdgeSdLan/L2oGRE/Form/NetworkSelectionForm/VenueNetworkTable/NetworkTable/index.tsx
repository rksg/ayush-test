/* eslint-disable max-len */
import { useMemo, useState } from 'react'

import { find, isNil, merge } from 'lodash'
import { AlignType }          from 'rc-table/lib/interface'
import { useIntl }            from 'react-intl'

import { Loader, Select, Table, TableColumn, TableProps, useStepFormContext } from '@acx-ui/components'
import { AddNetworkModal }                                                    from '@acx-ui/rc/components'
import { useVenueNetworkActivationsViewModelListQuery }                       from '@acx-ui/rc/services'
import {
  defaultSort,
  EdgeMvSdLanFormModel,
  isOweTransitionNetwork,
  Network,
  NetworkType,
  NetworkTypeEnum,
  sortProp,
  useTableQuery,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { WifiScopes }         from '@acx-ui/types'
import { filterByAccess }     from '@acx-ui/user'
import { getIntl, getOpsApi } from '@acx-ui/utils'

import { useEdgeSdLanContext }   from '../../../EdgeSdLanContextProvider'
import { NetworkActivationType } from '../../VenueNetworkTable/NetworksDrawer'

import { ActivateNetworkSwitchButton, ActivateNetworkSwitchButtonProps } from './ActivateNetworkSwitchButton'

// the state of 'Forward the guest traffic to DMZ' (ON/OFF) on the same network at different venues needs to be same
const getRowDisabledInfo = (
  row: Network,
  dsaeOnboardNetworkIds?: string[],
  pinNetworkIds?: string[]
) => {
  const { $t } = getIntl()
  let disabled = false
  let tooltip = undefined

  if (isOweTransitionNetwork(row)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is OWE transition network, cannot be SD-LAN traffic network.' })
  } else if (dsaeOnboardNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is an onboarding network for WPA3-DPSK3 for DPSK, cannot be SD-LAN traffic network.' })
  } else if (pinNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This network already used in Personal Identity Network, cannot be SD-LAN traffic network.' })
  }

  return { disabled, tooltip }
}

export interface ActivatedNetworksTableProps {
  venueId: string
  columnsSetting?: Partial<Omit<TableColumn<Network, 'text'>, 'render'>>[]
  activated?: NetworkActivationType['venueId']
  disabled?: boolean
  toggleButtonTooltip?: string
  onActivateChange?: ActivateNetworkSwitchButtonProps['onChange']
  onTunnelProfileChange?: (networkId: string, tunnelProfileId: string) => void
  isUpdating?: boolean
  pinNetworkIds?: string[]
}

export const ActivatedNetworksTable = (props: ActivatedNetworksTableProps) => {
  const {
    venueId,
    columnsSetting,
    activated,
    disabled,
    toggleButtonTooltip,
    onActivateChange,
    onTunnelProfileChange,
    isUpdating,
    pinNetworkIds
  } = props

  const { $t } = useIntl()
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const { form } = useStepFormContext<EdgeMvSdLanFormModel>()
  const { availableTunnelProfiles = [] } = useEdgeSdLanContext()

  const tableQuery = useTableQuery<Network>({
    useQuery: useVenueNetworkActivationsViewModelListQuery,
    defaultPayload: {
      sortField: 'name',
      sortOrder: 'ASC',
      fields: [
        'id',
        'name',
        'nwSubType',
        'vlanPool', // for GUI trigger vlan pooling API in RBAC version
        'dsaeOnboardNetwork'
      ],
      filters: {
        'venueApGroups.venueId': [venueId]
      }
    },
    option: {
      skip: !Boolean(venueId)
    }
  })

  const dcTunnelProfileId = form.getFieldValue('tunnelProfileId')

  const tunnelProfileOptions = useMemo(() =>[
    {
      label: $t({ defaultMessage: 'Core Port' }),
      value: ''
    },
    ...availableTunnelProfiles.filter(item => item.id !== dcTunnelProfileId)
      .map(item => ({
        label: item.name,
        value: item.id
      }))], [availableTunnelProfiles])

  const dsaeOnboardNetworkIds = (tableQuery.data?.data
    .map(item => item.dsaeOnboardNetwork?.id)
    .filter(i => !isNil(i)) ?? []) as string[]

  const defaultColumns: TableProps<Network>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: 'Active Network' }),
    tooltip: $t({ defaultMessage:
        // eslint-disable-next-line max-len
        'A list of the networks that have been activated on this <venueSingular></venueSingular>.' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Network Type' }),
    key: 'nwSubType',
    dataIndex: 'nwSubType',
    sorter: { compare: sortProp('nwSubType', defaultSort) },
    render: (_, row) => {
      return <NetworkType
        networkType={row.nwSubType as NetworkTypeEnum}
        row={row}
      />
    }
  }, {
    title: $t({ defaultMessage: 'Enable Tunnel' }),
    key: 'action',
    dataIndex: 'action',
    align: 'center' as AlignType,
    width: 80,
    render: (_: unknown, row: Network) => {
      const disabledInfo = getRowDisabledInfo(row, dsaeOnboardNetworkIds, pinNetworkIds)
      let isDisabled = disabled
      let tooltip = toggleButtonTooltip

      return <ActivateNetworkSwitchButton
        row={row}
        activated={activated?.map(item => item.networkId) ?? []}
        disabled={(isDisabled as boolean) || disabledInfo.disabled}
        tooltip={tooltip || disabledInfo.tooltip}
        onChange={onActivateChange}
      />
    }
  }, {
    title: $t({ defaultMessage: 'Forward Destination' }),
    key: 'action2',
    dataIndex: 'action2',
    width: 120,
    render: (_: unknown, row: Network) => {
      const isEnabledTunneling = activated?.some(item => item.networkId === row.id)
      const currentTunnelProfileId = activated?.find(item => item.networkId === row.id)?.tunnelProfileId
      return isEnabledTunneling && <Select
        style={{ width: 200 }}
        value={currentTunnelProfileId ?? ''}
        onChange={(value) => onTunnelProfileChange?.(row.id, value)}
        options={tunnelProfileOptions}
      />
    }
  }
  ]), [
    venueId,
    activated,
    onActivateChange,
    disabled,
    dsaeOnboardNetworkIds,
    pinNetworkIds
  ])

  const actions: TableProps<Network>['actions'] = [{
    scopeKey: [WifiScopes.CREATE],
    rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.addNetworkDeep)],
    label: $t({ defaultMessage: 'Add Wi-Fi Network' }),
    onClick: () => {
      setNetworkModalVisible(true)
    }
  }]

  const networkFormDefaultVals = useMemo(() => (venueId ? { defaultActiveVenues: [venueId] } : undefined),
    [venueId])

  return (
    <>
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isUpdating }
      ]}>
        <Table
          rowKey='id'
          columns={defaultColumns.map(item => merge(item,
            find(columnsSetting, { key: item.key })))}
          dataSource={tableQuery.data?.data}
          actions={filterByAccess(actions)}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Loader>
      <AddNetworkModal
        visible={networkModalVisible}
        setVisible={setNetworkModalVisible}
        defaultValues={networkFormDefaultVals}
      />
    </>
  )
}
