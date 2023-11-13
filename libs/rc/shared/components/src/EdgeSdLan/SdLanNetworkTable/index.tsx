import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Table, TableProps }                       from '@acx-ui/components'
import { useVenueNetworkActivationsDataListQuery } from '@acx-ui/rc/services'
import { NetworkSaveData, networkTypes }           from '@acx-ui/rc/utils'
import { useParams }                               from '@acx-ui/react-router-dom'

import { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export { ActivateNetworkSwitchButton } from './ActivateNetworkSwitchButton'

export interface ActivatedNetworksTableProps {
  venueId: string,
  columns?: TableProps<NetworkSaveData>['columns'],
  activated?: string[],
  allowActivate?: boolean,
  onActivateChange?: (
    data: NetworkSaveData,
    checked: boolean,
    activated: string[]) => void
}

export const EdgeSdLanActivatedNetworksTable = (props: ActivatedNetworksTableProps) => {
  const {
    venueId,
    columns,
    activated,
    allowActivate,
    onActivateChange
  } = props
  const params = useParams()
  const { $t } = useIntl()

  const { networkList } = useVenueNetworkActivationsDataListQuery({
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
    selectFromResult: ({ data, isLoading }) => {
      return {
        networkList: data,
        isLoading
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
    fixed: 'left'
  }, {
    title: $t({ defaultMessage: 'Network Type' }),
    key: 'type',
    dataIndex: 'type',
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
        allowActivate={allowActivate}
        onChange={onActivateChange}
      />
    }
  }]), [$t, activated, allowActivate])

  return (
    <Table
      rowKey='id'
      columns={columns ?? defaultColumns}
      dataSource={networkList}
    />
  )
}