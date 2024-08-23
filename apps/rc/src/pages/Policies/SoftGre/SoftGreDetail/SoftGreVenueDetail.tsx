import { useIntl } from 'react-intl'

import { Card,  Loader,  Table, TableProps }                          from '@acx-ui/components'
import { SimpleListTooltip }                                          from '@acx-ui/rc/components'
import { useGetVenuesSoftGrePolicyQuery }                             from '@acx-ui/rc/services'
import { SoftGreActivation, VenueTableUsageBySoftGre, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                 from '@acx-ui/react-router-dom'


const defaultVenuePayload = {
  fields: ['id', 'name', 'addressLine'],
  page: 1,
  pageSize: 10_000,
  filters: {
    id: [] as string[]
  }
}
interface SoftGreVenueDetailProps {
  activations: SoftGreActivation[]
}
export default function SoftGreVenueDetail (props: SoftGreVenueDetailProps) {
  const { activations } = props
  const { $t } = useIntl()

  const tableQuery = useTableQuery({
    useQuery: useGetVenuesSoftGrePolicyQuery,
    defaultPayload: {
      ...defaultVenuePayload,
      activations
    },
    option: {
      skip: !activations || activations.length === 0
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
      title: $t({ defaultMessage: 'City, Country' }),
      dataIndex: 'addressLine',
      key: 'addressLine'
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Applied Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      render: (_, row) => {
        if (!row.wifiNetworkIds || row.wifiNetworkIds.length === 0) return ''
        const tooltipItems = row?.wifiNetworkNames as string[]
        // eslint-disable-next-line max-len
        return <SimpleListTooltip items={tooltipItems} displayText={row?.wifiNetworkNames?.length} />
      }
    }
  ]
  return columns
}