import { useMemo, useState } from 'react'

import { Space, Typography }      from 'antd'
import { isNil, merge, find }     from 'lodash'
import _                          from 'lodash'
import { AlignType }              from 'rc-table/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableColumn, TableProps } from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery }                from '@acx-ui/rc/services'
import {
  defaultSort,
  NetworkSaveData,
  networkTypes,
  sortProp,
  isOweTransitionNetwork,
  isDsaeOnboardingNetwork,
  NetworkTypeEnum,
  useTableQuery,
  Network,
  NetworkType
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'


import { AddNetworkModal } from '../../../NetworkForm/AddNetworkModal'

import { ActivateNetworkSwitchButtonP2, ActivateNetworkSwitchButtonP2Props } from './ActivateNetworkSwitchButton'
import ForwardGuestTrafficDiagramVertical                                    from './assets/images/edge-sd-lan-forward-guest-traffic.png'
import * as UI                                                               from './styledComponents'

const dmzTunnelColumnHeaderTooltip = defineMessage({
  defaultMessage:
    // eslint-disable-next-line max-len
    'When \'Forward guest traffic to DMZ\' is activated, the \'Enable tunnel\' toggle turns on automatically. {detailLink}'
})
export interface ActivatedNetworksTableP2Props {
  venueId: string,
  isGuestTunnelEnabled: boolean
  columnsSetting?: Partial<Omit<TableColumn<NetworkSaveData, 'text'>, 'render'>>[],
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
  const [moreDetailToolipVisible, setMoreDetailToolipVisible] = useState(false)

  const tableQuery = useTableQuery<NetworkSaveData>({
    useQuery: useVenueNetworkActivationsDataListQuery,
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

  const showMoreDetails = () => {
    setDetailDrawerOpenVisible(true)
    handleMoreDetailsTooltipVisibleChange(false)
  }
  const handleMoreDetailsTooltipVisibleChange = (visible: boolean) => {
    setMoreDetailToolipVisible(visible)
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
      const disabled = isOweTransitionNetwork(row) || isDsaeOnboardingNetwork(row)

      return <ActivateNetworkSwitchButtonP2
        fieldName='activatedNetworks'
        row={row}
        activated={activated ?? []}
        disabled={disabled || hasAccess() === false}
        onChange={onActivateChange}
      />
    }
  }, ...(isGuestTunnelEnabled ? [{
    title: $t({ defaultMessage: 'Forward Guest Traffic to DMZ' }),
    tooltip: $t(dmzTunnelColumnHeaderTooltip, {
      detailLink: <Button type='link' onClick={showMoreDetails}>
        {$t({ defaultMessage: 'More details about the feature.' })}
      </Button>
    }),
    key: 'action2',
    dataIndex: 'action2',
    align: 'center' as AlignType,
    width: 120,
    render: (_: unknown, row: Network) => {
      const isVlanPooling = !isNil(row.wlan?.advancedCustomization?.vlanPool)
      const disabled = isVlanPooling
                          || (isOweTransitionNetwork(row) || isDsaeOnboardingNetwork(row))

      return row.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL
        ? <ActivateNetworkSwitchButtonP2
          fieldName='activatedGuestNetworks'
          row={row}
          activated={activatedGuest ?? []}
          disabled={disabled || hasAccess() === false}
          tooltip={isVlanPooling
            ? $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
            : undefined}
          onChange={onActivateChange}
        />
        : ''
    }
  }] : [])
  // eslint-disable-next-line max-len
  ]), [$t, activated, activatedGuest, isGuestTunnelEnabled, onActivateChange, moreDetailToolipVisible])

  const actions: TableProps<NetworkSaveData>['actions'] = [{
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
    <Space direction='vertical' size={45}>
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