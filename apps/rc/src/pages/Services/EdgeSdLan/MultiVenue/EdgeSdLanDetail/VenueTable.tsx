import { useEffect, useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip }   from '@acx-ui/components'
import { useVenuesListQuery }                   from '@acx-ui/rc/services'
import { sortProp, defaultSort, arraySizeSort } from '@acx-ui/rc/utils'
import { TenantLink }                           from '@acx-ui/react-router-dom'

interface VenueTableProps {
  sdLanVenueData: VenueTableDataType[]
}

export interface VenueTableDataType {
  venueId: string
  venueName: string
  address: string
  apCount: number
  selectedNetworks: {
    networkId: string
    networkName: string
  }[]
}

export const VenueTable = (props: VenueTableProps) => {
  const { sdLanVenueData = [] } = props
  const { $t } = useIntl()
  const [tableData, setTableData] = useState<VenueTableDataType[]>([])

  const venueIds = sdLanVenueData.map(item => item.venueId)

  const defaultPayload = {
    fields: ['id', 'country', 'city', 'aggregatedApStatus'],
    filters: { id: venueIds }
  }

  const { data: venueList, isFetching } = useVenuesListQuery(
    { payload: defaultPayload },
    { skip: venueIds.length === 0 }
  )
  useEffect(() => {
    setTableData(sdLanVenueData.map(item => {
      const targetVenueDetail = venueList?.data.find(venue => venue.id === item.venueId)
      return {
        ...item,
        address: `${targetVenueDetail?.country ?? ''}, ${targetVenueDetail?.city ?? ''}`,
        apCount: targetVenueDetail?.aggregatedApStatus
          ? Object.values(targetVenueDetail.aggregatedApStatus)
            .reduce((a, b) => a + b, 0)
          : 0
      }
    }))
  }, [venueList])

  const columns: TableProps<VenueTableDataType>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      sorter: { compare: sortProp('venueName', defaultSort) },
      defaultSortOrder: 'ascend',
      render: (_, row) => (
        <TenantLink
          to={`/venues/${row.venueId}/venue-details/overview`}
          children={row.venueName}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      key: 'address',
      dataIndex: 'address',
      sorter: { compare: sortProp('address', defaultSort) }

    },
    {
      title: $t({ defaultMessage: 'APs' }),
      key: 'apCount',
      dataIndex: 'apCount',
      sorter: { compare: sortProp('apCount', defaultSort) },
      render: (_, row) => (row.apCount ?? 0)
    },
    {
      title: $t({ defaultMessage: 'Selected Networks' }),
      key: 'selectedNetworks',
      dataIndex: 'selectedNetworks',
      sorter: { compare: sortProp('selectedNetworks', arraySizeSort) },
      render: (_, row) => (
        row.selectedNetworks?.length ?
          <Tooltip
            title={row.selectedNetworks.map(item => (
              <Row key={item.networkId}>
                {item.networkName}
              </Row>
            ))}
            children={row.selectedNetworks.length}
            dottedUnderline
          /> :
          0
      )
    }
  ]

  return (
    <Loader states={[{ isFetching, isLoading: false }]}>
      <Table
        rowKey='venueId'
        columns={columns}
        dataSource={tableData}
      />
    </Loader>
  )
}
