import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                            from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery }              from '@acx-ui/rc/services'
import { defaultSort, NetworkSaveData, networkTypes, sortProp } from '@acx-ui/rc/utils'
import { useParams }                                            from '@acx-ui/react-router-dom'

import { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export interface ActivatedNetworksTableProps {
  venueId: string,
  columns?: TableProps<NetworkSaveData>['columns'],
  activated?: string[],
  onActivateChange?: (
    data: NetworkSaveData,
    checked: boolean,
    activated: string[]) => void,
  isUpdating?: boolean
}

export const EdgeSdLanActivatedNetworksTable = (props: ActivatedNetworksTableProps) => {
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
        networkList: data,
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
    align: 'center',
    width: 80,
    render: (_, row) => {
      return <ActivateNetworkSwitchButton
        row={row}
        activated={activated ?? []}
        onChange={onActivateChange}
      />
    }
  }]), [$t, activated])

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
}