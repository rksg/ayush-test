import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, Table, TableProps } from '@acx-ui/components'
import { useGetAccessControlRulesQuery }               from '@acx-ui/rc/services'
import {
  useTableQuery,
  MacAclRule
} from '@acx-ui/rc/utils'

export default function AccessControlOverview () {
  const { $t } = useIntl()

  const settingsId = 'switch-access-control-overview'

  const defaultPayload = {
    fields: [
      'id',
      'action',
      'sourceAddress',
      'sourceMask',
      'destinationAddress',
      'destinationMask',
      'macAclId'
    ],
    pagination: { settingsId }
  }

  // const { venueFilterOptions } = useVenuesListQuery({
  //   payload: {
  //     fields: ['name', 'country', 'latitude', 'longitude', 'id'],
  //     pageSize: 10000,
  //     sortField: 'name',
  //     sortOrder: 'ASC'
  //   }
  // }, {
  //   selectFromResult: ({ data }) => ({
  //     venueFilterOptions: data?.data
  //       .map(v => ({ key: v.id, value: v.name }))
  //       .sort((a, b) => a.value.localeCompare(b.value)) || true
  //   })
  // })

  const tableQuery = useTableQuery<MacAclRule>({
    useQuery: useGetAccessControlRulesQuery,
    defaultPayload,
    sorter: { sortField: 'id', sortOrder: 'ASC' }
  })

  function useColumns () {
    const columns: TableProps<MacAclRule>['columns'] = [
      {
        key: 'action',
        title: $t({ defaultMessage: 'Action' }),
        dataIndex: 'action'
      },
      {
        key: 'sourceAddress',
        title: $t({ defaultMessage: 'Source MAC Address' }),
        dataIndex: 'sourceAddress'
      },
      {
        key: 'sourceMask',
        title: $t({ defaultMessage: 'Mask' }),
        dataIndex: 'sourceMask'
      },
      {
        key: 'destinationAddress',
        title: $t({ defaultMessage: 'Dest.  MAC Address' }),
        dataIndex: 'destinationAddress'
      },
      {
        key: 'destinationMask',
        title: $t({ defaultMessage: 'Dest. Mask' }),
        dataIndex: 'destinationMask'
      }
    ]
    return columns
  }

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <Loader states={[tableQuery]}>
          <Table<MacAclRule>
            settingsId={settingsId}
            columns={useColumns()}
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
            rowKey='switchId'
            onFilterChange={tableQuery.handleFilterChange}
          />
        </Loader>
      </GridCol>
    </GridRow>
  )
}
