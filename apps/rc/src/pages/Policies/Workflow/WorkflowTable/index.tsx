import { useState, useEffect } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  Button,
  PageHeader,
  Table,
  TableProps,
  Loader, showActionModal
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { EnrollmentPortalLink, WorkflowActionPreviewModal, WorkflowDrawer } from '@acx-ui/rc/components'
import {
  useDeleteWorkflowsMutation,
  useSearchInProgressWorkflowListQuery,
  useLazySearchWorkflowsVersionListQuery,
  useCloneWorkflowMutation, doProfileDelete,
  useLazyGetWorkflowStepsByIdQuery
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
  WorkflowDetailsTabKey,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByPolicy,
  getPolicyAllowedOperation, InitialEmptyStepsCount
} from '@acx-ui/rc/utils'
import {
  TenantLink
} from '@acx-ui/react-router-dom'

function useColumns (workflowMap: Map<string, Workflow>) {
  const { $t } = useIntl()

  const columns: TableProps<Workflow>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: function (_, row) {
        return (
          <TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.WORKFLOW,
              oper: PolicyOperation.DETAIL,
              policyId: row.id!!,
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
      render: (_, row) => $t({ defaultMessage: `{
        status, select,
        PUBLISHED {Published}
        other {Draft}
      }` }, {
        status: workflowMap.get(row.id!)?.publishedDetails?.status
      })
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description'
    },
    {
      key: 'url',
      title: $t({ defaultMessage: 'URL' }),
      dataIndex: 'url',
      render: (_, row) => {
        if (workflowMap.get(row.id!)?.publishedDetails?.status === 'PUBLISHED') {
          const link = workflowMap.get(row.id!)?.links?.find(v => v.rel === 'enrollmentPortal')
          if (link) return <EnrollmentPortalLink url={link.href}/>
        }
        return undefined
      }
    }
  ]

  return columns
}


export default function WorkflowTable () {
  const { $t } = useIntl()
  const [workflowMap, setWorkflowMap] = useState(new Map<string, Workflow>())
  const [deleteWorkflows,
    { isLoading: isDeleteWorkflowing }
  ] = useDeleteWorkflowsMutation()
  const [cloneWorkflow] = useCloneWorkflowMutation()
  const [getWorkflowStepsById]= useLazyGetWorkflowStepsByIdQuery()
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()
  const settingsId = 'workflow-table'
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewId, setPreviewId] = useState<string>()
  // eslint-disable-next-line max-len
  const [drawerState, setDrawerState] = useState<{ visible: boolean, data?: Workflow }> ({ visible: false })
  const tableQuery = useTableQuery( {
    useQuery: useSearchInProgressWorkflowListQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {},
    pagination: { settingsId }
  })

  const isWorkflowTemplateEnable = useIsSplitOn(Features.WORKFLOW_TEMPLATE_TOGGLE)

  const fetchVersionHistory = async (workflows: Workflow[]) => {
    try {
      const result = await searchVersionedWorkflows(
        { params: { excludeContent: 'false' }, payload: workflows.map(workflow => workflow.id) }
      ).unwrap()
      if (result) {
        result.forEach(v => {
          if (v.publishedDetails?.status === 'PUBLISHED') {
            setWorkflowMap(map => new Map(map.set(v.publishedDetails?.parentWorkflowId!!, v)))
          }
        })
      }
    } catch (e) {}
  }

  useEffect(() => {
    if (tableQuery.isLoading || tableQuery.isFetching) return
    setWorkflowMap(new Map())
    fetchVersionHistory(tableQuery.data?.data ?? [])
  }, [tableQuery.data, tableQuery.isFetching])


  const rowActions: TableProps<Workflow>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.WORKFLOW, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([data],clearSelection) => {
        setPreviewVisible(false)
        setDrawerState({ visible: true, data: data })
        clearSelection()
      },
      visible: (selectedItems => selectedItems.length === 1)
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.CREATE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.WORKFLOW, PolicyOperation.CREATE),
      label: $t({ defaultMessage: 'Clone' }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: ([data], clearSelection) => {
        // eslint-disable-next-line max-len
        getWorkflowStepsById({ params: { policyId: data.id, pageSize: '1', page: '0', sort: 'id,ASC', excludeContent: 'true' } })
          .unwrap()
          .then((result) => {
            if ((result?.paging?.totalCount ?? 0 ) <= InitialEmptyStepsCount) {
              showActionModal({
                type: 'warning',
                // eslint-disable-next-line max-len
                content: $t({ defaultMessage: 'You are unable to clone a workflow without any steps' }),
                customContent: {
                  action: 'SHOW_ERRORS'
                }
              })
            } else {
              // eslint-disable-next-line max-len
              cloneWorkflow({ params: { id: data.id } })
                .unwrap()
                .then(() => {
                  clearSelection()
                })
                .catch((e) => {
                  // eslint-disable-next-line no-console
                  console.log(e)
                })
            }
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e)
          })
      },
      visible: (selectedItems => selectedItems.length === 1 && isWorkflowTemplateEnable)
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.DETAIL),
      label: $t({ defaultMessage: 'Preview' }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick: ([data], clearSelection) => {
        setDrawerState({ visible: false })
        setPreviewId(workflowMap.get(data.id!)?.id ?? data.id)
        setPreviewVisible(true)
        clearSelection()
      },
      visible: (selectedItems => selectedItems.length === 1)
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.DELETE),
      rbacOpsIds: getPolicyAllowedOperation(PolicyType.WORKFLOW, PolicyOperation.DELETE),
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedItems, clearSelection) => {

        let containsPublishedWorkflow = false
        selectedItems.forEach(w => {
          if(w.id && workflowMap.get(w.id)){containsPublishedWorkflow = true}})

        doProfileDelete(selectedItems,
          $t({ defaultMessage: 'Workflow' }),
          selectedItems.length === 1 ? selectedItems[0].name : undefined,
          [],
          async () => {
            const ids = selectedItems.map(v => v.id!)
            deleteWorkflows({ payload: ids })
              .unwrap()
              .then(() => {
                setWorkflowMap(map => {
                  ids.forEach(id => map.delete(id!))
                  return new Map(map)
                })
                clearSelection()
              })
              .catch((e) => {
                // eslint-disable-next-line no-console
                console.log(e)
              })
          },
          containsPublishedWorkflow ?
            (<p><br/><Typography.Text type='danger'>
              {$t({ defaultMessage: 'WARNING: This action will delete published workflows.' })}
            </Typography.Text></p>)
            : undefined)
      }
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      filters: customSearch?.searchString ? { name: customSearch?.searchString } : undefined
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
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            scopeKey={getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.CREATE)}
            rbacOpsIds={getPolicyAllowedOperation(PolicyType.WORKFLOW, PolicyOperation.CREATE)}
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
        rowActions={allowedRowActions}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
      />
      {previewVisible && previewId &&
      <WorkflowActionPreviewModal
        disablePortalDesign
        workflowId={previewId}
        onClose={()=>{
          setPreviewVisible(false)
          setPreviewId(undefined)
        }}/>}
      {
        drawerState.visible &&
        <WorkflowDrawer
          onClose={()=>{setDrawerState({ visible: false })}}
          visible={true}
          data={drawerState.data!}
        />
      }
    </Loader>
  )
}
