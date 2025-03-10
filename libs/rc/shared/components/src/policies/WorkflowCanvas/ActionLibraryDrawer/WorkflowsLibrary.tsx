import { useState } from 'react'

import {  Menu, MenuProps, Space } from 'antd'
import { useIntl }                 from 'react-intl'

import { Button, showActionModal }             from '@acx-ui/components'
import { Dropdown, Loader, Table, TableProps } from '@acx-ui/components'
import {
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowStepsByIdQuery,
  useNestedCloneWorkflowMutation,
  useSearchInProgressWorkflowListQuery
} from '@acx-ui/rc/services'
import {
  FILTER,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  getScopeKeyByPolicy, InitialEmptyStepsCount, MaxTotalSteps,
  PolicyOperation,
  PolicyType,
  SEARCH,
  useTableQuery,
  Workflow,
  WorkflowDetailsTabKey
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { WorkflowActionPreviewModal } from '../../../WorkflowActionPreviewModal'

interface WorkflowsLibraryProps {
  onClose: () => void,
  workflowId: string,
  stepId: string | undefined
}

export default function WorkflowsLibrary (props: WorkflowsLibraryProps) {
  const { onClose, workflowId, stepId } = props
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewId, setPreviewId] = useState<string>()
  const [nestedCloneWorkflow] = useNestedCloneWorkflowMutation()
  const [getWorkflowStepsById]= useLazyGetWorkflowStepsByIdQuery()
  const [hoverRow, setHoverRow] = useState<string>('')
  const { $t } = useIntl()

  const tableQuery = useTableQuery( {
    useQuery: useSearchInProgressWorkflowListQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {}
  })

  const { data: stepsData } = useGetWorkflowStepsByIdQuery({
    params: {
      policyId: workflowId, pageSize: '1', page: '0', sort: 'id,ASC', excludeContent: 'true'
    }
  })

  const handlePreview = (workflowId: string) => {
    setPreviewId(workflowId)
    setPreviewVisible(true)
  }

  const handleClone = (referencedWorkflowId: string) => {
    try {
      if(stepId) {
        getWorkflowStepsById({
          params: {
            policyId: referencedWorkflowId,
            pageSize: '1',
            page: '0',
            sort: 'id,ASC',
            excludeContent: 'true'
          }
        }).unwrap()
          .then((result) => {
            if ((result?.paging?.totalCount ?? 0) <= InitialEmptyStepsCount) {
              showActionModal({
                type: 'warning',
                // eslint-disable-next-line max-len
                content: $t({ defaultMessage: 'You are unable to import a workflow without any steps' }),
                customContent: {
                  action: 'SHOW_ERRORS'
                }
              })
            } else {
              if ((stepsData?.paging?.totalCount ?? 0)
                + (result?.paging?.totalCount - InitialEmptyStepsCount ?? 0) // start and end steps will not be cloned
                > MaxTotalSteps) {
                showActionModal({
                  type: 'warning',
                  // eslint-disable-next-line max-len
                  content: $t({ defaultMessage: 'You will exceed the maximum number of steps after importing this workflow.' }),
                  customContent: {
                    action: 'SHOW_ERRORS'
                  }
                })
              } else {
                nestedCloneWorkflow(
                  { params: { id: workflowId, stepId, referencedWorkflowId } }
                ).unwrap()
                onClose()
              }
            }
          }).catch((e) => {
          // eslint-disable-next-line no-console
            console.log(e)
          })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    setPreviewId(undefined)
    setPreviewVisible(false)
    onClose()
  }

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      filters: customSearch?.searchString ? { name: customSearch?.searchString } : undefined
    }
    tableQuery.setPayload(payload)
  }

  function useColumns () {
    const [ referenceId, setReferenceId ] = useState('')

    const handleMenuClick: MenuProps['onClick'] = (e) => {
      if (e.key === 'as-independent-copy') {
        handleClone(referenceId)
      }
    }

    const menuItem = (title: string, description: string) => {
      return (<div style={{ maxWidth: '262px', maxHeight: '61px', fontSize: '14px' }}>
        <strong>{title}</strong>
        <p style={{ color: '#7F7F7F', fontSize: '12px' }}>{description}</p>
      </div>
      )}

    const addMenu = <Menu onClick={handleMenuClick}>
      <Menu.Item key='as-independent-copy'>
        {menuItem(
          $t({ defaultMessage: 'As independent copy' }),
          // eslint-disable-next-line max-len
          $t({ defaultMessage: 'No reference maintained; changes to the original workflow will not affect this copy' })
        )}
      </Menu.Item>
    </Menu>

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
              onClick={handleClose}>{row.name}</TenantLink>
          )
        }
      },
      {
        key: 'description',
        title: $t({ defaultMessage: 'Description' }),
        dataIndex: 'description'
      },
      {
        key: 'previewAndAdd',
        dataIndex: 'previewAndAdd',
        render: (_, row) => {
          return hoverRow === row.id && <Space>
            <Button type='primary'
              scopeKey={getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.DETAIL)}
              onClick={() => handlePreview(row.id!!)}>{$t({ defaultMessage: 'Preview' })}</Button>
            <Dropdown
              // eslint-disable-next-line max-len
              disabled={workflowId === row.id || (stepsData?.paging?.totalCount ?? 0 ) <= InitialEmptyStepsCount}
              scopeKey={getScopeKeyByPolicy(PolicyType.WORKFLOW, PolicyOperation.EDIT)}
              rbacOpsIds={getPolicyAllowedOperation(PolicyType.WORKFLOW, PolicyOperation.EDIT)}
              overlay={addMenu}>{() =>
                <Button type='primary'
                  onClick={() =>
                    setReferenceId(row.id!!)}>{ $t({ defaultMessage: 'Add' }) }
                </Button>}
            </Dropdown>
          </Space>
        }
      }
    ]
    return columns
  }

  return (
    <Loader states={[tableQuery]}>
      <Table
        enableApiFilter
        columns={useColumns()}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onRow={(record) => ({
          onMouseOver: () => setHoverRow(record?.id ?? ''),
          onMouseLeave: () => setHoverRow('')
        })}
        rowKey='id' />
      {previewVisible && previewId &&
        <WorkflowActionPreviewModal
          disablePortalDesign
          workflowId={previewId}
          onClose={()=>{
            setPreviewVisible(false)
            setPreviewId(undefined)
          }}/>}
    </Loader>)
}
