import { useMemo, useState } from 'react'

import { Form, Space } from 'antd'
import { get }         from 'lodash'
import { AlignType }   from 'rc-table/lib/interface'
import { useIntl }     from 'react-intl'

import { Loader, Table, TableProps, Tooltip } from '@acx-ui/components'
import { useVenuesListQuery }                 from '@acx-ui/rc/services'
import {
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

import { EdgeMvSdLanFormNetwork } from '..'

import { NetworksDrawer } from './NetworksDrawer'


export interface VenueNetworksTableProps {
  activated?: EdgeMvSdLanFormNetwork,
  activatedGuest?: EdgeMvSdLanFormNetwork,
}

export const EdgeSdLanVenueNetworksTable = (props: VenueNetworksTableProps) => {
  const { $t } = useIntl()
  const formRef = Form.useFormInstance()
  const { activated } = props

  const [networkDrawerVenueId, setNetworkDrawerVenueId] = useState<string|undefined>(undefined)

  // TODO: The list should filter out the venues that already tied to other SDLAN services.
  const tableQuery = useTableQuery<Venue>({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      fields: ['name', 'country', 'city', 'id'],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<Venue>['columns'] = useMemo(() => ([{
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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
    render: (_, row) => {
      const venueNetworks = get(activated, row.id) as { id:string, name: string }[]
      const networkCount = venueNetworks?.length ?? 0
      const networkNames = venueNetworks?.filter(i => i)
        .map(item => <span key={item.id}>{item.name}</span>)
      return networkCount > 0
        ? <Tooltip dottedUnderline
          title={<Space direction='vertical'>
            {networkNames}
          </Space>}
          children={networkCount}
        />
        : networkCount
    }
  }]), [activated])

  const rowActions: TableProps<Venue>['rowActions'] = [{
    label: $t({ defaultMessage: 'Select Networks' }),
    onClick: (selectedRows) => {
      setNetworkDrawerVenueId(selectedRows[0].id)
    }
  }]

  const closeNetworkModal = () => {
    setNetworkDrawerVenueId(undefined)
  }

  const isNetworkDrawerVisible = !!networkDrawerVenueId

  return (
    <>
      <Loader states={[
        tableQuery
      ]}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={tableQuery.data?.data}
          rowActions={filterByAccess(rowActions)}
          rowSelection={{ type: 'radio' }}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
        />
      </Loader>
      {networkDrawerVenueId && <NetworksDrawer
        visible={isNetworkDrawerVisible}
        onClose={closeNetworkModal}
        venueId={networkDrawerVenueId!}
        venueName={tableQuery.data?.data.find(item => item.id === networkDrawerVenueId)?.name}
        formRef={formRef}
      />}
    </>
  )
}