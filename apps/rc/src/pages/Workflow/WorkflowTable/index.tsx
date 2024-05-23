import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Loader, PageHeader, Table, TableProps } from '@acx-ui/components'
import { SuccessSolid }                          from '@acx-ui/icons'
import { WorkflowLink }                          from '@acx-ui/rc/components'
import { useGetWorkflowsQuery }                  from '@acx-ui/rc/services'
import { useTableQuery, Workflow }               from '@acx-ui/rc/utils'
import { noDataDisplay }                         from '@acx-ui/utils'
// import { filterByAccess, hasAccess } from '@acx-ui/user'


const useColumns = () => {
  const { $t } = useIntl()

  const columns: TableProps<Workflow>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'Name' }),
      align: 'center',
      sorter: true,
      render: (_, { id, name }) =>
        <WorkflowLink id={id} name={name}/>
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: $t({ defaultMessage: 'Description' }),
      align: 'center',
      sorter: true
    },
    {
      key: 'publishedState',
      dataIndex: 'publishedState',
      title: $t({ defaultMessage: 'Published' }),
      align: 'center',
      sorter: true,
      render: (_, { publishedState }) => {
        return publishedState ? <SuccessSolid/> : noDataDisplay
      }
    },
    {
      key: 'publishedDate',
      dataIndex: 'publishedDate',
      title: $t({ defaultMessage: 'Published Date' }),
      align: 'center',
      sorter: true,
      render: (_, { publishedDate }) => {
        return publishedDate
          ? moment(publishedDate!).format('YYYY/MM/DD')
          : noDataDisplay
      }
    }
  ]
  return columns
}



export default function WorkflowTable () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery<Workflow>({
    useQuery: useGetWorkflowsQuery,
    defaultPayload: { },
    pagination: { settingsId: 'workflow-management-table' }
  })

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Onboarding Workflows ($count)' })} />
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          rowKey='id'
          settingsId='workflow-management-table'
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          // rowActions={filterByAccess(rowActions)}
          // rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
        />
      </Loader>
    </>
  )
}
