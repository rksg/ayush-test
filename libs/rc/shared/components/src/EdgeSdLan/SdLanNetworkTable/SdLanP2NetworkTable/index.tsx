/* eslint-disable max-len */
import { useMemo, useState } from 'react'

import { Space }                  from 'antd'
import { find, isNil, merge }     from 'lodash'
import { AlignType }              from 'rc-table/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { Features }                                               from '@acx-ui/feature-toggle'
import { useVenueNetworkActivationsViewModelListQuery }           from '@acx-ui/rc/services'
import {
  defaultSort,
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

import { AddNetworkModal }       from '../../../NetworkForm/AddNetworkModal'
import { useIsEdgeFeatureReady } from '../../../useEdgeActions'

import { ActivateNetworkSwitchButtonP2, ActivateNetworkSwitchButtonP2Props } from './ActivateNetworkSwitchButton'
import ForwardGuestTrafficDiagramVertical                                    from './assets/images/edge-sd-lan-forward-guest-traffic.svg'
import * as UI                                                               from './styledComponents'

const dmzTunnelColumnHeaderTooltip = defineMessage({
  defaultMessage:
    // eslint-disable-next-line max-len
    'When \'Forward guest traffic to DMZ\' is activated, the \'Enable tunnel\' toggle turns on automatically. {detailLink}'
})

// the state of 'Forward the guest traffic to DMZ' (ON/OFF) on the same network at different venues needs to be same
const getRowDisabledInfo = (
  venueId: string,
  row: Network,
  isForGuestTraffic: boolean,
  dsaeOnboardNetworkIds?: string[],
  pinNetworkIds?: string[]
) => {
  const { $t } = getIntl()
  const isGuestnetwork = row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL
  let disabled = false
  let tooltip = undefined

  const isVlanPooling = !isNil(row.vlanPool)
  if (isOweTransitionNetwork(row)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is OWE transition network, cannot be SD-LAN traffic network.' })
  } else if (dsaeOnboardNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is an onboarding network for WPA3-DPSK3 for DPSK, cannot be SD-LAN traffic network.' })
  } else if (isGuestnetwork && isForGuestTraffic && isVlanPooling) {
    disabled = true
    tooltip = $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
  } else if (pinNetworkIds?.includes(row.id)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This network already used in Personal Identity Network, cannot be SD-LAN traffic network.' })
  }

  return { disabled, tooltip }
}

type SdLanActivatedNetworksIsDisableFn = (
  venueId: string,
  row: Network,
  isGuestActivation: boolean
) => {
  isDisabled: boolean,
  tooltip?: string
} | undefined

export interface ActivatedNetworksTableP2Props {
  venueId: string,
  isGuestTunnelEnabled: boolean
  columnsSetting?: Partial<Omit<TableColumn<Network, 'text'>, 'render'>>[],
  activated?: string[],
  activatedGuest?: string[],
  disabled?: boolean | SdLanActivatedNetworksIsDisableFn,
  toggleButtonTooltip?: string,
  onActivateChange?: ActivateNetworkSwitchButtonP2Props['onChange'],
  isUpdating?: boolean,
  pinNetworkIds?: string[]
}

export const EdgeSdLanP2ActivatedNetworksTable = (props: ActivatedNetworksTableP2Props) => {
  const {
    venueId,
    isGuestTunnelEnabled,
    columnsSetting,
    activated,
    activatedGuest,
    disabled,
    toggleButtonTooltip,
    onActivateChange,
    isUpdating,
    pinNetworkIds
  } = props

  const { $t } = useIntl()
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerOpenVisible] = useState(false)

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

  const dsaeOnboardNetworkIds = (tableQuery.data?.data
    .map(item => item.dsaeOnboardNetwork?.id)
    .filter(i => !isNil(i)) ?? []) as string[]

  const showMoreDetails = () => {
    setDetailDrawerOpenVisible(true)
  }

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
      const disabledInfo = getRowDisabledInfo(venueId, row, false, dsaeOnboardNetworkIds, pinNetworkIds)
      let isDisabled = disabled
      let tooltip = toggleButtonTooltip
      if (typeof disabled === 'function') {
        isDisabled = disabled(venueId, row, false)?.isDisabled
        tooltip = disabled(venueId, row, false)?.tooltip
      }

      return <ActivateNetworkSwitchButtonP2
        fieldName='activatedNetworks'
        row={row}
        activated={activated ?? []}
        disabled={(isDisabled as boolean) || disabledInfo.disabled}
        tooltip={tooltip || disabledInfo.tooltip}
        onChange={onActivateChange}
      />
    }
  }, ...(isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'Forward Guest Traffic to DMZ' }),
    tooltip: !detailDrawerVisible
      ? $t(dmzTunnelColumnHeaderTooltip, {
        detailLink: <Button type='link' onClick={showMoreDetails} style={{ fontSize: 'inherit' }}>
          {$t({ defaultMessage: 'More details about the feature.' })}
        </Button>
      })
      : undefined,
    key: 'action2',
    dataIndex: 'action2',
    align: 'center' as AlignType,
    width: 120,
    render: (_: unknown, row: Network) => {
      const disabledInfo = getRowDisabledInfo(venueId, row, true, dsaeOnboardNetworkIds, pinNetworkIds)
      let isDisabled = disabled
      let tooltip = toggleButtonTooltip
      if (typeof disabled === 'function') {
        isDisabled = disabled(venueId, row, true)?.isDisabled
        tooltip = disabled(venueId, row, true)?.tooltip
      }

      return row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL
        ? <ActivateNetworkSwitchButtonP2
          fieldName='activatedGuestNetworks'
          row={row}
          activated={activatedGuest ?? []}
          disabled={(isDisabled as boolean) || disabledInfo.disabled}
          tooltip={tooltip || disabledInfo.tooltip}
          onChange={onActivateChange}
        />
        : ''
    }
  }] : [])
  ]), [
    venueId,
    activated,
    activatedGuest,
    isGuestTunnelEnabled,
    onActivateChange,
    detailDrawerVisible,
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
      <MoreDetailsDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerOpenVisible}
      />
    </>
  )
}

export const MoreDetailsDrawer = (props: { visible: boolean, setVisible: (open: boolean) => void }) => {
  const { $t } = useIntl()
  const isEdgeSdLanMvEnabled = useIsEdgeFeatureReady(Features.EDGE_SD_LAN_MV_TOGGLE)

  return <Drawer
    title={$t({ defaultMessage: 'Forward Guest Traffic to DMZ' })}
    width={450}
    visible={props.visible}
    onClose={() => props.setVisible(false)}
  >
    <Space direction='vertical' size={40}>
      <UI.DiagramContainer>
        <img
          src={ForwardGuestTrafficDiagramVertical}
          alt={$t({ defaultMessage: 'SD-LAN forward guest traffic' })}
        />
        {!isEdgeSdLanMvEnabled && <UI.FrameOverDiagram />}
      </UI.DiagramContainer>
      <UI.StyledParagraph>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Enabling \'Forward guest traffic to DMZ\' will tunnel the guest traffic further to the cluster (RUCKUS Edges) in DMZ. If it\'s disabled, the guest traffic could still be sent to the cluster (RUCKUS Edges) in the Data Center, but only if the \'Enable Tunnel\' toggle is enabled.' })
        }
      </UI.StyledParagraph>
    </Space>
  </Drawer>
}