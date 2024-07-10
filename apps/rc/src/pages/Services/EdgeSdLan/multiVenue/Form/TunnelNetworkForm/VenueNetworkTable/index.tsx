import { useMemo, useState } from 'react'

import { merge, find } from 'lodash'
import { AlignType }   from 'rc-table/lib/interface'
import { useIntl }     from 'react-intl'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useVenuesListQuery }                 from '@acx-ui/rc/services'
import {
  EdgeMvSdLanNetworks,
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { NetworksDrawer } from './NetworksDrawer'


export interface VenueNetworksTableProps {
  isGuestTunnelEnabled: boolean,
  activated?: EdgeMvSdLanNetworks,
  activatedGuest?: EdgeMvSdLanNetworks,
}

export const EdgeSdLanVenueNetworksTable = (props: VenueNetworksTableProps) => {
  const { $t } = useIntl()

  const [networkModalVenueId, setNetworkModalVenueId] = useState<string|undefined>(undefined)

  const tableQuery = useTableQuery<Venue>({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: ['name', 'country', 'city', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const defaultColumns: TableProps<Venue>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: 'Venue' }),
    key: 'name',
    dataIndex: 'name',
    defaultSortOrder: 'ascend',
    fixed: 'left',
    sorter: true
  }, {
    title: $t({ defaultMessage: 'Address' }),
    width: Infinity,
    key: 'country',
    dataIndex: 'country',
    sorter: true,
    render: (_, row) => {
      return `${row.country}, ${row.city}`
    }
  }, {
    title: $t({ defaultMessage: 'Selected Networks' }),
    key: 'selectedNetworks',
    dataIndex: 'selectedNetworks',
    align: 'center' as AlignType,
    width: 80,
    render: () => {
      const networkCount = 0
      const networkNames = ['network_1']
      return networkCount > 0
        ? <Tooltip dottedUnderline title={networkNames} children={networkCount} />
        : networkCount
    }
  }]), [])

  const rowActions: TableProps<Venue>['rowActions'] = [{
    label: $t({ defaultMessage: 'Select Networks' }),
    onClick: (selectedRows) => {
      setNetworkModalVenueId(selectedRows[0].id)
    }
  }]




  const closeNetworkModal = () => {
    setNetworkModalVenueId(undefined)
  }

  const isNetworkModalVisible = !!networkModalVenueId

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
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Loader>
      {networkModalVenueId && <NetworksDrawer
        visible={isNetworkModalVisible}
        onClose={closeNetworkModal}
        venueId={networkModalVenueId!}
        {...props}
      />}
    </>
  )
}