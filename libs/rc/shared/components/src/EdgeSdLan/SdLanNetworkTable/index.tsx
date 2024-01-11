import { useImperativeHandle, useMemo, forwardRef } from 'react'

import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Loader, Table, TableProps }                                                                             from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery }                                                               from '@acx-ui/rc/services'
import { defaultSort, NetworkSaveData, networkTypes, sortProp, isOweTransitionNetwork, isDsaeOnboardingNetwork } from '@acx-ui/rc/utils'
import { useParams }                                                                                             from '@acx-ui/react-router-dom'
import { hasAccess }                                                                                             from '@acx-ui/user'

import { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export interface ActivatedNetworksTableProps {
  venueId: string,
  columns?: TableProps<NetworkSaveData>['columns'],
  activated?: string[],
  onActivateChange?: (
    data: NetworkSaveData,
    checked: boolean,
    activated: NetworkSaveData[]
    ) => void,
  isUpdating?: boolean
}

export const EdgeSdLanActivatedNetworksTable = forwardRef(
  (props: ActivatedNetworksTableProps, ref) => {
    const {
      venueId,
      columns,
      activated,
      onActivateChange,
      isUpdating
    } = props
    const params = useParams()
    const { $t } = useIntl()

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
      title: $t({ defaultMessage: 'Activate on Venue' }),
      key: 'action',
      dataIndex: 'action',
      align: 'center' as AlignType,
      width: 80,
      render: (_: unknown, row: NetworkSaveData) => {
        return <ActivateNetworkSwitchButton
          row={row}
          rows={networkList!}
          activated={activated ?? []}
          disabled={hasAccess() === false}
          onChange={onActivateChange}
        />
      }
    }]), [$t, activated, networkList, onActivateChange])

    useImperativeHandle(ref, () => ({
      dataSource: networkList
    }), [networkList])

    return (
      <Loader states={[
        { isLoading, isFetching: isFetching || isUpdating }
      ]}>
        <Table
          rowKey='id'
          columns={columns ?? defaultColumns}
          dataSource={networkList}
        />
      </Loader>
    )
  })