import { useState, useEffect } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader } from '@acx-ui/components'
import {  DateFormatEnum,  userDateTimeFormat } from '@acx-ui/formatter'
import { EyeOpenSolid }                         from '@acx-ui/icons'
import {
  useDeleteWorkflowMutation,
  useSearchInProgressWorkflowListQuery,
  useLazySearchWorkflowListQuery
} from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  useTableQuery,
  getPolicyDetailsLink,
  FILTER,
  SEARCH,
  Workflow,
  WorkflowDetailsTabKey
} from '@acx-ui/rc/utils'
import {
  TenantLink,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'
function useColumns (workflowMap: Map<string, Workflow>) {
  const { $t } = useIntl()

  const columns: TableProps<Workflow>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.WORKFLOW,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!,
              activeTab: WorkflowDetailsTabKey.OVERVIEW
            })}
          >{row.name}</TenantLink>
        )
      }
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: false,
      render: (_, row) => $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Published}
        other {Draft}
      }` }, {
        status: workflowMap.get(row.id!)?.publishDetails?.status
      })
    },
    {
      key: 'publishedVersion',
      title: $t({ defaultMessage: 'Published Version' }),
      dataIndex: 'publishedVersion',
      render: (_, row) => $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {{version}}
        other {--}
      }` }, {
        status: workflowMap.get(row.id!)?.publishDetails?.status,
        version: workflowMap.get(row.id!)?.publishDetails?.version
      })
    },
    {
      key: 'identityGroup',
      title: $t({ defaultMessage: 'IdentityGroup' }),
      dataIndex: 'identityGroup',
      render: (_, row) => $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {{version}}
        other {--}
      }` }, {
        status: workflowMap.get(row.id!)?.publishDetails?.status,
        version: workflowMap.get(row.id!)?.publishDetails?.version
      })
    },
    {
      key: 'lastPublished',
      title: $t({ defaultMessage: 'Last Published' }),
      dataIndex: 'lastPublished',
      sorter: false,
      align: 'center',
      render: (_, row) => workflowMap.get(row.id!)?.publishDetails?.publishedDate ?
        moment(row.publishDetails?.publishedDate)
          .format(userDateTimeFormat(DateFormatEnum.DateTimeFormatWith12HourSystem))
        : noDataDisplay

    },
    {
      key: 'preview',
      title: $t({ defaultMessage: 'Preview' }),
      dataIndex: 'preview',
      sorter: false,
      align: 'center',
      render: (_, row) => <div><EyeOpenSolid/></div>

    }
  ]

  return columns
}


export default function WorkflowTable () {
  const { $t } = useIntl()
  const tenantBasePath = useTenantLink('')
  const navigate = useNavigate()
  const [workflowMap, setWorkflowMap] = useState(new Map<string, Workflow>())
  const [deleteWorkflow,
    { isLoading: isDeleteWorkflowing }
  ] = useDeleteWorkflowMutation()
  const [searchVersionedWorkflowById] = useLazySearchWorkflowListQuery()
  const settingsId = 'workflow-table'
  const tableQuery = useTableQuery( {
    useQuery: useSearchInProgressWorkflowListQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {},
    pagination: { settingsId }
  })

  useEffect(() => {
    if (tableQuery.isLoading) return
    const workflowMap = new Map()
    tableQuery.data?.data?.forEach(workflow => {
      workflowMap.set(workflow.id, workflow)
      searchVersionedWorkflowById({ params: { id: workflow.id, excludeContent: 'false' } })
        .then(result => {
          if (result.data) {
            result.data.data.forEach(v => {
              if (v.publishDetails?.status === 'PUBLISHED') {
                workflowMap.set(workflow.id, v)
              }
            })
          }
        // eslint-disable-next-line no-console
        }).catch(e => console.log(e))
      setWorkflowMap(workflowMap)
    })
  }, [tableQuery.data])


  const rowActions: TableProps<Workflow>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data],clearSelection) => {
        navigate({
          ...tenantBasePath,
          pathname: `${tenantBasePath.pathname}/` + getPolicyDetailsLink({
            type: PolicyType.WORKFLOW,
            oper: PolicyOperation.EDIT,
            policyId: data.id!!
          })
        })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    },
    // {
    //   label: $t({ defaultMessage: 'Clone' }),
    //   onClick: ([data], clearSelection) => {
    //     clearSelection()
    //   },
    //   disabled: (selectedItems => selectedItems.length > 1)
    // },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([data], clearSelection) => {
        const id = data.id
        deleteWorkflow({ params: { id } })
          .unwrap()
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e)
          })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    }
  ]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      name: customSearch?.searchString ?? ''
    }
    tableQuery.setPayload(payload)
  }

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteWorkflowing }
      ]}
    >
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={
          $t(
            { defaultMessage: 'Onboarding Workflows ({count})' },
            { count: tableQuery.data?.totalCount }
          )
        }
        extra={filterByAccess([
          <TenantLink
            to={getPolicyRoutePath({
              type: PolicyType.WORKFLOW,
              oper: PolicyOperation.CREATE
            })}
          >
            <Button type='primary'>
              { $t({ defaultMessage: 'Add Workflow' }) }
            </Button>
          </TenantLink>
        ])}
      />
      <Table
        settingsId={settingsId}
        enableApiFilter
        columns={useColumns(workflowMap)}
        rowActions={rowActions}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
  )
}