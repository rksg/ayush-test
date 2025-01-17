import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Card,  Loader,  Table, TableProps }                                                                                                                             from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                        from '@acx-ui/feature-toggle'
import { SimpleListTooltip }                                                                                                                                             from '@acx-ui/rc/components'
import { useGetVenuesSoftGrePolicyQuery }                                                                                                                                from '@acx-ui/rc/services'
import { ProfileLanApActivations, ProfileLanVenueActivations, SoftGreActivation, SoftGreViewData, VenueTableSoftGreActivation, VenueTableUsageBySoftGre, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                                    from '@acx-ui/react-router-dom'


const defaultVenuePayload = {
  fields: ['id', 'name', 'addressLine'],
  page: 1,
  pageSize: 10_000,
  filters: {
    id: [] as string[]
  }
}
interface SoftGreVenueDetailProps {
  data: SoftGreViewData
}
export default function SoftGreVenueDetail (props: SoftGreVenueDetailProps) {
  const { data } = props
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetVenuesSoftGrePolicyQuery,
    defaultPayload: {
      ...defaultVenuePayload,
      activations: getAggregatedActivations(
        data.activations,
        data.venueActivations,
        data.apActivations
      )
    },
    option: {
      skip: (
        !data.activations?.length &&
        !data.venueActivations?.length &&
        !data.apActivations?.length
      )
    }
  })

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({totalCount})' },
        { totalCount: tableQuery.data?.totalCount ?? 0 })}>
        <div style={{ width: '100%' }}>
          <Table<VenueTableUsageBySoftGre>
            enableApiFilter={true}
            columns={useColumns()}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            onFilterChange={tableQuery.handleFilterChange}
            rowKey='id'
          />
        </div>
      </Card>
    </Loader>
  )
}

function useColumns () {
  const { $t } = useIntl()
  const isEthernetSoftGreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)

  const columns: TableProps<VenueTableUsageBySoftGre>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        const { id, name } = row
        return <TenantLink to={`/venues/${id}/venue-details/overview`}>
          {name}
        </TenantLink>
      }
    },
    {
      title: (isEthernetSoftGreEnabled)?
        $t({ defaultMessage: 'Address' }):
        $t({ defaultMessage: 'City, Country' }),
      dataIndex: 'addressLine',
      key: 'addressLine'
    },
    {
      key: 'networkCount',
      title: (isEthernetSoftGreEnabled)?
        $t({ defaultMessage: 'Applied Wireless Networks' }):
        $t({ defaultMessage: 'Applied Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      render: (_, row) => {
        if (!row.wifiNetworkIds || row.wifiNetworkIds.length === 0) return '0'
        const tooltipItems = row?.wifiNetworkNames as string[]
        return <SimpleListTooltip
          items={tooltipItems}
          displayText={row?.wifiNetworkNames?.length}
        />
      }
    },
    ...(isEthernetSoftGreEnabled?[
      {
        key: 'apCount',
        title: $t({ defaultMessage: 'Applied Wired APs' }),
        dataIndex: 'apCount',
        align: 'center' as AlignType,
        render: (_:React.ReactNode, row:VenueTableUsageBySoftGre) => {
          if (!row.apSerialNumbers || row.apSerialNumbers.length === 0) return '0'
          const tooltipItems = row?.apNames as string[]
          return <SimpleListTooltip items={tooltipItems} displayText={row?.apNames?.length} />
        }
      }
    ]:[])


  ]
  return columns
}

function getAggregatedActivations (
  activations: SoftGreActivation[],
  venueActivations: ProfileLanVenueActivations[],
  apActivations: ProfileLanApActivations[] ){

  const aggregated: Record<string, VenueTableSoftGreActivation> = {}
  const createVenueTableSoftGreActivation = (): VenueTableSoftGreActivation => ({
    wifiNetworkIds: new Set<string>(),
    apSerialNumbers: new Set<string>()
  })

  if(activations) {
    activations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableSoftGreActivation()
      }
      activation.wifiNetworkIds.forEach(id =>
        aggregated[activation.venueId].wifiNetworkIds.add(id)
      )
    })
  }

  if(venueActivations) {
    venueActivations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableSoftGreActivation()
      }
      activation.apSerialNumbers?.forEach(serial =>
        aggregated[activation.venueId].apSerialNumbers.add(serial)
      )
    })
  }

  if(apActivations) {
    apActivations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableSoftGreActivation()
      }

      aggregated[activation.venueId].apSerialNumbers.add(activation.apSerialNumber)
    })
  }
  return aggregated
}
