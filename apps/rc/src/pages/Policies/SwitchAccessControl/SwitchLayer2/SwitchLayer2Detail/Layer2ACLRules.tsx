import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, Table, TableProps } from '@acx-ui/components'
import { useGetLayer2AclRulesQuery }                   from '@acx-ui/rc/services'
import {
  useTableQuery,
  MacAclRule
} from '@acx-ui/rc/utils'

export default function Layer2ACLRules () {
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

  const tableQuery = useTableQuery<MacAclRule>({
    useQuery: useGetLayer2AclRulesQuery,
    defaultPayload,
    sorter: { sortField: 'id', sortOrder: 'ASC' }
  })

  function useColumns () {
    const columns: TableProps<MacAclRule>['columns'] = [
      {
        key: 'action',
        title: $t({ defaultMessage: 'Action' }),
        dataIndex: 'action',
        render: (_, row) => {
          return row.action === 'permit' ?
            $t({ defaultMessage: 'Permit' }) : $t({ defaultMessage: 'Deny' })
        }
      },
      {
        key: 'sourceAddress',
        title: $t({ defaultMessage: 'Source MAC Address' }),
        dataIndex: 'sourceAddress',
        render: (_, row) => {
          return row.sourceAddress === 'any' ?
            $t({ defaultMessage: 'Any' }) : row.sourceAddress
        }
      },
      {
        key: 'sourceMask',
        title: $t({ defaultMessage: 'Mask' }),
        dataIndex: 'sourceMask'
      },
      {
        key: 'destinationAddress',
        title: $t({ defaultMessage: 'Dest.  MAC Address' }),
        dataIndex: 'destinationAddress',
        render: (_, row) => {
          return row.destinationAddress === 'any' ?
            $t({ defaultMessage: 'Any' }) : row.destinationAddress
        }
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
