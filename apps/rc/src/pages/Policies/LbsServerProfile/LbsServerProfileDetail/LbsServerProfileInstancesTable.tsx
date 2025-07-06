import { useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Card, Loader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }                       from '@acx-ui/rc/components'
import { useVenuesListQuery }                      from '@acx-ui/rc/services'
import {
  LbsServerProfileViewModel,
  Venue
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { useTableQuery } from '@acx-ui/utils'

import { LbsServerVenueApsDrawer } from './LbsServerVenueApsDrawer'

const defaultVenuePayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'aggregatedApStatus',
    'networks'
  ],
  page: 1,
  pageSize: 1024
}

export function LbsServerProfileInstancesTable (props: { data: LbsServerProfileViewModel }) {
  const { $t } = useIntl()
  const { data } = props
  const [ selectedVenue, setSelectedVenue ] = useState<Venue>()
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  const venueIds = data?.venueIds || []

  const tableQuery = useTableQuery<Venue>({
    useQuery: useVenuesListQuery,
    defaultPayload: {
      ...defaultVenuePayload,
      filters: { id: venueIds }
    },
    option: {
      skip: !venueIds?.length
    }
  })

  const handleCheckAps = (selectedVenue: Venue) => {
    setSelectedVenue(selectedVenue)
    setDrawerVisible(true)
  }

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`venues/${row.id}/venue-details/overview`}>
          {row.name}
        </TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: '# of APs' }),
      key: 'aggregatedApStatus',
      dataIndex: 'aggregatedApStatus',
      sorter: true,
      render: function (_, row) {
        const count = row.aggregatedApStatus
          ? Object.values(row.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
        return (
          <Button type='link'
            onClick={() => {
              handleCheckAps(row)
            }}
            children={count ? count : 0} />
        )
      }
    },
    {
      title: $t({ defaultMessage: '# of Networks' }),
      dataIndex: 'networks',
      key: 'networks',
      sorter: true,
      render: (_, row) => {
        return (
          row.networks ?
            <SimpleListTooltip
              items={row.networks?.names}
              displayText={row.networks?.count}
            /> : 0
        )
      }
    }
  ]

  return (
    <Card title={$t({ defaultMessage: 'Instances ({count})' },
      { count: tableQuery.data?.totalCount ?? 0 }
    )}>
      <Loader states={[tableQuery]} >
        <Table
          columns={columns}
          onChange={tableQuery.handleTableChange}
          dataSource={tableQuery.data?.data}
          rowKey='id'
        />
      </Loader>
      {selectedVenue
        ? <LbsServerVenueApsDrawer
          venue={selectedVenue}
          visible={drawerVisible}
          setVisible={setDrawerVisible}
        />
        : null
      }
    </Card>
  )
}
