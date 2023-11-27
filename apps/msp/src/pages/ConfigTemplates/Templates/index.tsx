import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetConfigTemplateListQuery } from '@acx-ui/msp/services'
import { ConfigTemplate }                from '@acx-ui/msp/utils'
import {
  useTableQuery
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { ApplyTemplateDrawer } from './ApplyTemplateDrawer'


export function ConfigTemplateList () {
  const { $t } = useIntl()
  const [ applyTemplateDrawerVisible, setApplyTemplateDrawerVisible ] = useState(false)
  const [ selectedTemplates, setSelectedTemplates ] = useState<string[]>([])

  const tableQuery = useTableQuery({
    useQuery: useGetConfigTemplateListQuery,
    defaultPayload: {}
  })

  const rowActions: TableProps<ConfigTemplate>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Apply Template' }),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows.map(row => row.id!))
        setApplyTemplateDrawerVisible(true)
      }
    }
  ]

  const actions: TableProps<ConfigTemplate>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Template' }),
      onClick: () => {}
    }
  ]

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<ConfigTemplate>
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          actions={filterByAccess(actions)}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'checkbox' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
      {applyTemplateDrawerVisible &&
      <ApplyTemplateDrawer
        setVisible={setApplyTemplateDrawerVisible}
        templateIds={selectedTemplates}
      />}
    </>
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true
    },
    {
      key: 'category',
      title: $t({ defaultMessage: 'Category' }),
      dataIndex: 'category',
      sorter: true
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true
    },
    {
      key: 'appliedTo',
      title: $t({ defaultMessage: 'Applied To' }),
      dataIndex: 'appliedTo',
      sorter: true,
      align: 'center'
    },
    {
      key: 'createdBy',
      title: $t({ defaultMessage: 'Created By' }),
      dataIndex: 'createdBy',
      sorter: true
    },
    {
      key: 'createdOn',
      title: $t({ defaultMessage: 'Created On' }),
      dataIndex: 'createdOn',
      sorter: true
    },
    {
      key: 'lastModified',
      title: $t({ defaultMessage: 'Last Modified' }),
      dataIndex: 'lastModified',
      sorter: true
    },
    {
      key: 'lastApplied',
      title: $t({ defaultMessage: 'Last Applied' }),
      dataIndex: 'lastApplied',
      sorter: true
    }
  ]

  return columns
}
