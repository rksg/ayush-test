import { useImperativeHandle, useMemo, forwardRef, useState } from 'react'

import { isNil, merge, find }     from 'lodash'
import { AlignType }              from 'rc-table/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Table, TableColumn, TableProps }                                                                                 from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery }                                                                                from '@acx-ui/rc/services'
import { defaultSort, NetworkSaveData, networkTypes, sortProp, isOweTransitionNetwork, isDsaeOnboardingNetwork, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { useParams }                                                                                                              from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                                                                                              from '@acx-ui/user'

import { AddNetworkModal } from '../../../NetworkForm/AddNetworkModal'

import { ActivateNetworkSwitchButtonP2, ActivateNetworkSwitchButtonP2Props } from './ActivateNetworkSwitchButton'

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

export const EdgeSdLanP2ActivatedNetworksTable = forwardRef(
  (props: ActivatedNetworksTableP2Props, ref) => {
    const {
      venueId,
      isGuestTunnelEnabled,
      columnsSetting,
      activated,
      activatedGuest,
      onActivateChange,
      isUpdating
    } = props
    const params = useParams()
    const { $t } = useIntl()
    const [networkModalVisible, setNetworkModalVisible] = useState(false)
    const { networkList, isLoading, isFetching } = useVenueNetworkActivationsDataListQuery({
      params: { ...params },
      payload: {
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        venueId: venueId,
        fields: [
          'id',
          'name',
          'type'
        ]
      }
    }, {
      skip: !Boolean(venueId),
      selectFromResult: ({ data, isLoading, isFetching }) => {
        return {
          networkList: data?.filter(item =>
            !isOweTransitionNetwork(item) && !isDsaeOnboardingNetwork(item)
          ),
          isLoading,
          isFetching
        }
      }
    })

    const defaultColumns: TableProps<NetworkSaveData>['columns'] = useMemo(() => ([{
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
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      render: (_, row) => {
        return $t(networkTypes[row.type!])
      }
    }, {
      title: $t({ defaultMessage: 'Enable Tunnel' }),
      key: 'action',
      dataIndex: 'action',
      align: 'center' as AlignType,
      width: 80,
      render: (_: unknown, row: NetworkSaveData) => {
        return <ActivateNetworkSwitchButtonP2
          fieldName='activatedNetworks'
          row={row}
          rows={networkList!}
          activated={activated ?? []}
          disabled={hasAccess() === false}
          onChange={onActivateChange}
        />
      }
    }, ...(isGuestTunnelEnabled ? [{
      title: $t({ defaultMessage: 'Forward Guest Traffic to DMZ' }),
      tooltip: $t(dmzTunnelColumnHeaderTooltip, {
        detailLink: <a href=''>
          {$t({ defaultMessage: 'More details about the feature.' })}
        </a>
      }),
      key: 'action2',
      dataIndex: 'action2',
      align: 'center' as AlignType,
      width: 120,
      render: (_: unknown, row: NetworkSaveData) => {
        const isVlanPooling = !isNil(row.wlan?.advancedCustomization?.vlanPool)
        return row.type === NetworkTypeEnum.CAPTIVEPORTAL
          ? <ActivateNetworkSwitchButtonP2
            fieldName='activatedGuestNetworks'
            row={row}
            rows={networkList!}
            activated={activatedGuest ?? []}
            disabled={hasAccess() === false || isVlanPooling}
            tooltip={isVlanPooling
              ? $t({ defaultMessage: 'Cannot tunnel vlan pooling network to DMZ cluster.' })
              : undefined}
            onChange={onActivateChange}
          />
          : ''
      }
    }] : [])
    ]), [$t, activated, networkList, onActivateChange])

    const actions: TableProps<NetworkSaveData>['actions'] = [{
      label: $t({ defaultMessage: 'Add Wi-Fi Network' }),
      onClick: () => {
        setNetworkModalVisible(true)
      }
    }]

    useImperativeHandle(ref, () => ({
      dataSource: networkList
    }), [networkList])

    return (
      <>
        <Loader states={[
          { isLoading, isFetching: isFetching || isUpdating }
        ]}>
          <Table
            rowKey='id'
            columns={defaultColumns.map(item => merge(item,
              find(columnsSetting, { key: item.key })))}
            dataSource={networkList}
            actions={filterByAccess(actions)}
          />
        </Loader>
        <AddNetworkModal
          visible={networkModalVisible}
          setVisible={setNetworkModalVisible}
          defaultActiveVenues={[venueId]}
        />
      </>
    )
  })