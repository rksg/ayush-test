import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, Table, TableProps } from '@acx-ui/components'
import { SuccessSolid }                  from '@acx-ui/icons'
import { WorkflowLink }                  from '@acx-ui/rc/components'
import { useQueryWorkflowListQuery }     from '@acx-ui/rc/services'
import { useTableQuery, Workflow }       from '@acx-ui/rc/utils'
import { noDataDisplay }                 from '@acx-ui/utils'
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
  // const tableQuery = useTableQuery<Workflow>({
  //   useQuery: useQueryWorkflowListQuery,
  //   defaultPayload: {
  //
  //   }
  // })

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Workflows' })} />
      {/*<Loader states={[*/}
      {/*  tableQuery,*/}
      {/*  { isLoading: false }]}>*/}
      <Table
        rowKey='id'
        settingsId='integrator-customers-table'
        columns={useColumns()}
        // @ts-ignore
        dataSource={[
          // @ts-ignore
          {
            id: 'db88bef3-4b30-472f-b7d2-69fd66b4c8e2',
            name: 'DemoWorkflow',
            publishedState: 'true',
            publishedDate: '2024-01-01T10:00:00Z'
          },
          // @ts-ignore
          { id: 'cfac9007-bc73-4582-a873-2610c945a0aa',
            name: 'JerryWorkflow',
            publishedState: 'false',
            publishedDate: '2023-12-30T10:00:00Z'
          },
          // @ts-ignore
          {
            id: '420cb015-cd5a-4215-a3c0-8d120d64ec1a',
            name: 'Jerry Workflow SplitTest',
            publishedState: 'false',
            publishedDate: '2023-12-30T10:00:00Z'
          }
        ]}
        // dataSource={tableQuery.data?.data}
        // pagination={tableQuery.pagination}
        // onChange={tableQuery.handleTableChange}
        // onFilterChange={tableQuery.handleFilterChange}
        // rowActions={filterByAccess(rowActions)}
        // rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
      />
      {/*</Loader>*/}
    </>
  )
}
