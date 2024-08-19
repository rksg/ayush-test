import { useIntl } from 'react-intl'

import { Card,  Loader,  Table, TableProps }                                     from '@acx-ui/components'
import { SimpleListTooltip }                                                     from '@acx-ui/rc/components'
import { useGetVenuesSoftGrePolicyQuery }                                        from '@acx-ui/rc/services'
import { SoftGreActivationInformation, VenueTableUsageBySoftGre, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                            from '@acx-ui/react-router-dom'


const defaultVenuePayload = {
  fields: ['id', 'name', 'addressLine'],
  search: {
    searchTargetFields: ['name']
  },
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10_000,
  filters: {
    id: [] as string[]
  }
}
interface SoftGreVenueDetailProps {
  activationInformations: SoftGreActivationInformation[]
}
export default function SoftGreVenueDetail (props: SoftGreVenueDetailProps) {
  const { activationInformations } = props
  const { $t } = useIntl()
  // const [ basicData, setBasicData ] = useState<VenueTableUsageBySoftGre[]>()

  const tableQuery = useTableQuery({
    useQuery: useGetVenuesSoftGrePolicyQuery,
    defaultPayload: {
      ...defaultVenuePayload,
      activationInformations
    },
    option: {
      skip: !activationInformations || activationInformations.length === 0
    },
    search: {
      searchTargetFields: ['name']
    }
  })
  // const basicData = tableQuery.data?.data

  // useEffect(() => {
  //   if (tableQuery?.data?.data) {
  //     setBasicData(tableQuery?.data?.data)
  //   }
  // }, [tableQuery])

  return (
    <Loader states={[tableQuery]}>
      <Card title={`${$t({ defaultMessage: 'Instances' })} (${tableQuery.data?.totalCount ?? 0})`}>
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
      sorter: true,
      key: 'addressLine'
    },
    {
      key: 'networkCount',
      title: $t({ defaultMessage: 'Applied Networks' }),
      dataIndex: 'networkCount',
      align: 'center',
      sorter: true,
      render: (_, row) => {
        if (!row.networkIds || row.networkIds.length === 0) return 0
        const tooltipItems = row?.networkNames as string[]
        return <SimpleListTooltip items={tooltipItems} displayText={row?.networkNames?.length} />
      }
    }
  ]
  return columns
}