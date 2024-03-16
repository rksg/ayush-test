import { useMemo, useState } from 'react'

import { Space, Typography }      from 'antd'
import { isNil, merge, find }     from 'lodash'
import _                          from 'lodash'
import { AlignType }              from 'rc-table/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { useVenueNetworkActivationsViewModelListQuery }           from '@acx-ui/rc/services'
import {
  defaultSort,
  sortProp,
  isOweTransitionNetwork,
  isDsaeOnboardingNetwork,
  NetworkTypeEnum,
  useTableQuery,
  Network,
  NetworkType
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

import { AddNetworkModal } from '../../../NetworkForm/AddNetworkModal'

import { ActivateNetworkSwitchButtonP2, ActivateNetworkSwitchButtonP2Props } from './ActivateNetworkSwitchButton'
import ForwardGuestTrafficDiagramVertical                                    from './assets/images/edge-sd-lan-forward-guest-traffic.png'
import * as UI                                                               from './styledComponents'

const dmzTunnelColumnHeaderTooltip = defineMessage({
  defaultMessage:
    // eslint-disable-next-line max-len
    'When \'Forward guest traffic to DMZ\' is activated, the \'Enable tunnel\' toggle turns on automatically. {detailLink}'
})

const getRowDisabledInfo = (
  row: Network,
  isForGuestTraffic: boolean,
  dsaeOnboardNetworkIds?: string[]
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
    //TODO: need to refactor after wifi team data migration done.
  } else if (dsaeOnboardNetworkIds?.includes(row.id) || isDsaeOnboardingNetwork(row)) {
    disabled = true
    // eslint-disable-next-line max-len
    tooltip = $t({ defaultMessage: 'This is an onboarding network for WPA3-DPSK3 for DPSK, cannot be SD-LAN traffic network.' })
  } else if (isGuestnetwork && isForGuestTraffic && isVlanPooling) {
    disabled = true
    tooltip = $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
  } else {}

  return { disabled, tooltip }
}

export interface ActivatedNetworksTableP2Props {
  venueId: string,
  isGuestTunnelEnabled: boolean
  columnsSetting?: Partial<Omit<TableColumn<Network, 'text'>, 'render'>>[],
  activated?: string[],
  activatedGuest?: string[],
  onActivateChange?: ActivateNetworkSwitchButtonP2Props['onChange'],
  isUpdating?: boolean
}

export const EdgeSdLanP2ActivatedNetworksTable = (props: ActivatedNetworksTableP2Props) => {
  const {
    venueId,
    isGuestTunnelEnabled,
    columnsSetting,
    activated,
    activatedGuest,
    onActivateChange,
    isUpdating
  } = props

  const { $t } = useIntl()
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerOpenVisible] = useState(false)

  const tableQuery = useTableQuery<Network>({
    useQuery: useVenueNetworkActivationsViewModelListQuery,
    apiParams: { venueId },
    defaultPayload: {
      sortField: 'name',
      sortOrder: 'ASC',
      venueId,
      fields: [
        'id',
        'name',
        'type'
      ]
    },
    option: {
      skip: !Boolean(venueId)
    }
  })

  const dsaeOnboardNetworkIds = (tableQuery.data?.data
    .map(item => item.dsaeOnboardNetwork?.id)
    .filter(i => !_.isNil(i)) ?? []) as string[]

  const showMoreDetails = () => {
    setDetailDrawerOpenVisible(true)
  }

  const defaultColumns: TableProps<Network>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: 'Active Network' }),
    tooltip: $t({ defaultMessage:
        'A list of the networks that have been activated on this venue.' }),
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
      const disabledInfo = getRowDisabledInfo(row, false, dsaeOnboardNetworkIds)

      return <ActivateNetworkSwitchButtonP2
        fieldName='activatedNetworks'
        row={row}
        activated={activated ?? []}
        disabled={disabledInfo.disabled || hasAccess() === false}
        tooltip={disabledInfo.tooltip}
        onChange={onActivateChange}
      />
    }
  }, ...(isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'Forward Guest Traffic to DMZ' }),
    tooltip: !detailDrawerVisible ? $t(dmzTunnelColumnHeaderTooltip, {
      detailLink: <Button type='link' onClick={showMoreDetails}>
        {$t({ defaultMessage: 'More details about the feature.' })}
      </Button>
    }) : undefined,
    key: 'action2',
    dataIndex: 'action2',
    align: 'center' as AlignType,
    width: 120,
    render: (_: unknown, row: Network) => {
      const disabledInfo = getRowDisabledInfo(row, true, dsaeOnboardNetworkIds)

      return row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL
        ? <ActivateNetworkSwitchButtonP2
          fieldName='activatedGuestNetworks'
          row={row}
          activated={activatedGuest ?? []}
          disabled={disabledInfo.disabled || hasAccess() === false}
          tooltip={disabledInfo.tooltip}
          onChange={onActivateChange}
        />
        : ''
    }
  }] : [])
  // eslint-disable-next-line max-len
  ]), [activated, activatedGuest, isGuestTunnelEnabled, onActivateChange, detailDrawerVisible])

  const actions: TableProps<Network>['actions'] = [{
    label: $t({ defaultMessage: 'Add Wi-Fi Network' }),
    onClick: () => {
      setNetworkModalVisible(true)
    }
  }]

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
          // TODO: confirm is need?
          // onFilterChange={tableQuery.handleFilterChange}
        />
      </Loader>
      <AddNetworkModal
        visible={networkModalVisible}
        setVisible={setNetworkModalVisible}
        defaultActiveVenues={[venueId]}
      />
      <MoreDetailsDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerOpenVisible}
      />
    </>
  )
}

const MoreDetailsDrawer = (props: { visible: boolean, setVisible: (open: boolean) => void }) => {
  const { $t } = useIntl()

  return <Drawer
    title={$t({ defaultMessage: 'Forward Guest Traffic to DMZ' })}
    width={400}
    visible={props.visible}
    onClose={() => props.setVisible(false)}
  >
    <Space direction='vertical' size={40}>
      <UI.DiagramContainer>
        <img
          src={ForwardGuestTrafficDiagramVertical}
          alt={$t({ defaultMessage: 'SD-LAN forward guest traffic' })}
        />
        <UI.FrameOverDiagram />
      </UI.DiagramContainer>
      <Typography.Paragraph>
        {
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'Enabling \'Forward guest traffic to DMZ\' will tunnel the guest traffic further to the cluster (SmartEdges) in DMZ. If it\'s disabled, the guest traffic could still be sent to the cluster (SmartEdges) in the Data Center, but only if the \'Enable Tunnel\' toggle is enabled.' })
        }
      </Typography.Paragraph>
    </Space>
  </Drawer>
}