import { useEffect, useState } from 'react'

import { Button, Menu, MenuProps, Space } from 'antd'
import { useIntl }                        from 'react-intl'

import { Dropdown, Loader, Table, TableProps }                                          from '@acx-ui/components'
import { useLazySearchWorkflowsVersionListQuery, useSearchInProgressWorkflowListQuery } from '@acx-ui/rc/services'
import {
  FILTER, getPolicyDetailsLink, PolicyOperation, PolicyType, SEARCH, useTableQuery,
  Workflow, WorkflowDetailsTabKey
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { WorkflowActionPreviewModal } from '../../../WorkflowActionPreviewModal'

interface WorkflowsLibraryProps {
  onClose: () => void,
  onConfigureClose: () => void
}

function useColumns (
  onClose: () => void,
  handleClose: () => void,
  handlePreview: (workflowId: string) => void,
  handleClone: (referenceWorkflowId: string) => void) {
  const { $t } = useIntl()

  const [ referenceId, setReferenceId ] = useState('')

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'as-independent-copy') {
      handleClone(referenceId)
      onClose()
    }
  }

  const addMenu = <Menu onClick={handleMenuClick}>
    <Menu.Item key='as-independent-copy'>
      <div>
        <strong>As independent copy</strong>
        No reference maintained; changes to the original workflow will not affect this copy
      </div>
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
        return <Space>
          <Button type='primary'
            onClick={() => handlePreview(row.id!!)}>{$t({ defaultMessage: 'Preview' })}</Button>
          { <Dropdown
            // scopeKey={[WifiScopes.CREATE]}
            // rbacOpsIds={[getOpsApi(WifiRbacUrlsInfo.addAp), getOpsApi(WifiRbacUrlsInfo.addApGroup)]}
            overlay={addMenu}>{() =>
              <Button type='primary'
                onClick={() => setReferenceId(row.id!!)}>{ $t({ defaultMessage: 'Add' }) }</Button>}
          </Dropdown>
          }
        </Space>
      }
    }
  ]

  return columns
}

export default function WorkflowsLibrary (props: WorkflowsLibraryProps) {
  const { onClose, onConfigureClose } = props
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewId, setPreviewId] = useState<string>()
  const [workflowMap, setWorkflowMap] = useState(new Map<string, Workflow>())
  const [searchVersionedWorkflows] = useLazySearchWorkflowsVersionListQuery()

  const tableQuery = useTableQuery( {
    useQuery: useSearchInProgressWorkflowListQuery,
    apiParams: { sort: 'name,ASC', excludeContent: 'false' },
    defaultPayload: {}
  })

  const handlePreview = (workflowId: string) => {
    setPreviewId(workflowMap.get(workflowId)?.id ?? workflowId)
    setPreviewVisible(true)
  }

  const handleClone = (referenceId: string) => {
    alert(referenceId)
  }

  const handleClose = () => {
    setPreviewId(undefined)
    setPreviewVisible(false)
    onClose()
    onConfigureClose()
  }

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...tableQuery.payload,
      filters: customSearch?.searchString ? { name: customSearch?.searchString } : undefined
    }
    tableQuery.setPayload(payload)
  }

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

  return (
    <Loader states={[tableQuery]}>
      <Table
        enableApiFilter
        columns={useColumns(onClose, handleClose, handlePreview, handleClone)}
        onFilterChange={handleFilterChange}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
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
