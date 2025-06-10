import { useIntl } from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps }     from '@acx-ui/components'
import { CommonConfigTemplateDrawerProps, useEcFilters } from '@acx-ui/main/components'
import { useMspCustomerListQuery }                       from '@acx-ui/msp/services'
import { MspEc }                                         from '@acx-ui/msp/utils'
import { useTableQuery }                                 from '@acx-ui/rc/utils'


export const AppliedToTenantDrawer = (props: CommonConfigTemplateDrawerProps) => {
  const { $t } = useIntl()
  const { setVisible, selectedTemplate } = props
  const ecFilters = useEcFilters()

  const mspEcTenantsPayload = {
    filters: {
      ...ecFilters,
      id: [...(selectedTemplate.appliedOnTenants ?? [])]
    },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ]
  }

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: mspEcTenantsPayload,
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    }
  })

  const onClose = () => {
    setVisible(false)
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    }
  ]

  const content = <Loader states={[tableQuery]}>
    <Table<MspEc>
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      settingsId='msp-applied-template-table'
      rowKey='id'
      enableApiFilter={true}
    />
  </Loader>

  const footer = <div>
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Applied to EC tenants' })}
      visible={true}
      onClose={onClose}
      footer={footer}
      destroyOnClose={true}
      width={700}
    >
      {content}
    </Drawer>
  )
}
