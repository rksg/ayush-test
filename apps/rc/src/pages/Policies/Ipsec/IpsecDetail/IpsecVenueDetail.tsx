import { AlignType } from 'rc-table/lib/interface'
import { useIntl }   from 'react-intl'

import { Card, Loader, Table, TableProps } from '@acx-ui/components'
import { SimpleListTooltip }               from '@acx-ui/rc/components'
import { useGetVenuesIpsecPolicyQuery }    from '@acx-ui/rc/services'
import {
  IpsecActivation,
  IpsecViewData,
  IpsecWiredActivation,
  IpsecWiredApActivation,
  useTableQuery,
  VenueTableIpsecActivation,
  VenueTableUsageByIpsec
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'


const defaultVenuePayload = {
  fields: ['id', 'name', 'addressLine'],
  page: 1,
  pageSize: 10_000,
  filters: {
    id: [] as string[]
  }
}

interface IpsecDetailProps {
  data: IpsecViewData
}

export default function IpsecVenueDetail (props: IpsecDetailProps) {
  const { data } = props
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetVenuesIpsecPolicyQuery,
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
          <Table<VenueTableUsageByIpsec>
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

  const columns: TableProps<VenueTableUsageByIpsec>['columns'] = [
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
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'addressLine',
      key: 'addressLine'
    },
    {
      title: $t({ defaultMessage: 'SoftGRE' }),
      dataIndex: 'softGreProfileId',
      key: 'softGreProfileId',
      render: (_, row) => {
        const { softGreProfileId, softGreProfileName } = row
        return <TenantLink to={`/policies/softGre/${softGreProfileId}/detail`}>
          {softGreProfileName}
        </TenantLink>
      }
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Applied Wireless Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      render: (_, row) => {
        if (!row.wifiNetworkIds || row.wifiNetworkIds.length === 0) return ''
        const tooltipItems = row?.wifiNetworkNames as string[]
        return <SimpleListTooltip
          items={tooltipItems}
          displayText={row?.wifiNetworkNames?.length}
        />
      }
    },
    {
      key: 'apCount',
      title: $t({ defaultMessage: 'Applied Wired APs' }),
      dataIndex: 'apCount',
      align: 'center' as AlignType,
      render: (_:React.ReactNode, row:VenueTableUsageByIpsec) => {
        if (!row.apSerialNumbers || row.apSerialNumbers.length === 0) return ''
        const tooltipItems = row?.apNames as string[]
        return <SimpleListTooltip items={tooltipItems} displayText={row?.apNames?.length} />
      }
    }
  ]
  return columns
}

function getAggregatedActivations (
  activations: IpsecActivation[],
  venueActivations: IpsecWiredActivation[],
  apActivations: IpsecWiredApActivation[] ){

  const aggregated: Record<string, VenueTableIpsecActivation> = {}
  const createVenueTableIpsecActivation = (): VenueTableIpsecActivation => ({
    wifiNetworkIds: new Set<string>(),
    apSerialNumbers: new Set<string>()
  })

  if(activations) {
    activations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableIpsecActivation()
      }
      activation.wifiNetworkIds.forEach(id =>
        aggregated[activation.venueId].wifiNetworkIds.add(id)
      )
      aggregated[activation.venueId].softGreProfileId = activation.softGreProfileId
    })
  }

  if(venueActivations) {
    venueActivations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableIpsecActivation()
      }
      activation.apSerialNumbers.forEach(serial =>
        aggregated[activation.venueId].apSerialNumbers.add(serial)
      )
    })
  }

  if(apActivations) {
    apActivations.forEach(activation => {
      if (!aggregated[activation.venueId]) {
        aggregated[activation.venueId] = createVenueTableIpsecActivation()
      }

      aggregated[activation.venueId].apSerialNumbers.add(activation.apSerialNumber)
    })
  }

  // // eslint-disable-next-line no-console
  // console.log(aggregated)
  return aggregated
}