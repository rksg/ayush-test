import { Key, ReactNode, useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Col, Row }            from 'antd'
import { useIntl }             from 'react-intl'

import { Loader, Table, TableProps, showActionModal }                             from '@acx-ui/components'
import { Features }                                                               from '@acx-ui/feature-toggle'
import { CheckMark }                                                              from '@acx-ui/icons'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { EdgeSubInterface, EdgeUrlsInfo, TableQuery }                             from '@acx-ui/rc/utils'
import { EdgeScopes, RequestPayload }                                             from '@acx-ui/types'
import { filterByAccess, hasPermission }                                          from '@acx-ui/user'
import { getOpsApi }                                                              from '@acx-ui/utils'

import * as UI from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'

interface SubInterfaceTableProps {
  currentTab: string
  ip: string
  mac: string
  tableQuery: TableQuery<EdgeSubInterface, RequestPayload<unknown>, unknown>
  handleAdd: (data: EdgeSubInterface) => Promise<unknown>
  handleUpdate: (data: EdgeSubInterface) => Promise<unknown>
  handleDelete: (data: EdgeSubInterface) => Promise<unknown>
  handleUpload: (formData: FormData) => Promise<unknown>
  uploadResult: unknown
}

interface UploadResultType {
  isLoading: boolean
  error: FetchBaseQueryError
}

const importTemplateLink = 'assets/templates/sub-interfaces_import_template.csv'

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const isEdgeSubInterfaceCSVEnabled = useIsEdgeFeatureReady(Features.EDGES_SUB_INTERFACE_CSV_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const {
    currentTab,
    ip,
    mac,
    tableQuery,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleUpload,
    uploadResult
  } = props

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [importModalvisible, setImportModalvisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeSubInterface>()
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  const closeDrawers = () => {
    setDrawerVisible(false)
    setImportModalvisible(false)
  }

  useEffect(() => {
    closeDrawers()
    setSelectedRows([])
  }, [currentTab])

  useEffect(() => {
    return () => {
      closeDrawers()
    }
  }, [])

  const columns: TableProps<EdgeSubInterface>['columns'] = [
    {
      title: '#',
      key: '',
      dataIndex: 'index',
      width: 50,
      render: (_, __, index) => {
        const pagination = tableQuery.pagination
        return ++index + (pagination.page - 1) * pagination.pageSize
      }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      width: 80
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet'
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlan',
      dataIndex: 'vlan'
    },
    ...(
      isEdgeCoreAccessSeparationReady ?
        [
          {
            title: $t({ defaultMessage: 'Core Port' }),
            align: 'center' as const,
            key: 'corePortEnabled',
            dataIndex: 'corePortEnabled',
            render: (_data: ReactNode, row: EdgeSubInterface) => {
              return row.corePortEnabled && <CheckMark width={20} height={20} />
            }
          },
          {
            title: $t({ defaultMessage: 'Access Port' }),
            align: 'center' as const,
            key: 'accessPortEnabled',
            dataIndex: 'accessPortEnabled',
            render: (_data: ReactNode, row: EdgeSubInterface) => {
              return row.accessPortEnabled && <CheckMark width={20} height={20} />
            }
          }
        ]
        : []
    )
  ]

  const rowActions: TableProps<EdgeSubInterface>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.updateSubInterfaces)],
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        openDrawer(selectedRows[0])
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.deleteSubInterfaces)],
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Sub-Interface' }),
            entityValue: selectedRows[0].vlan.toString(),
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            handleDelete(selectedRows[0]).then(clearSelection)
          }
        })
      }
    }
  ]

  const actionButtons = [
    {
      label: $t({ defaultMessage: 'Add Sub-interface' }),
      scopeKey: [EdgeScopes.CREATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.addSubInterfaces)],
      onClick: () => openDrawer()
    },
    ...(isEdgeSubInterfaceCSVEnabled ? [{
      label: $t({ defaultMessage: 'Import from file' }),
      scopeKey: [EdgeScopes.CREATE],
      rbacOpsIds: [getOpsApi(EdgeUrlsInfo.importSubInterfacesCSV)],
      onClick: () => setImportModalvisible(true)
    }]:[])
  ]

  const openDrawer = (data?: EdgeSubInterface) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const importSubInterfaces = async (formData: FormData) => {
    try {
      await handleUpload(formData)
      setImportModalvisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isSelectionVisible = hasPermission({ scopes: [EdgeScopes.UPDATE, EdgeScopes.DELETE] })

  return (
    <>
      <UI.IpAndMac>
        {
          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: ip || 'N/A', mac: mac }
          )
        }
      </UI.IpAndMac>
      <Row>
        <Col span={14}>
          <SubInterfaceDrawer
            mac={mac}
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            data={currentEditData}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
          />
          <Loader states={[tableQuery]}>
            <Table<EdgeSubInterface>
              actions={filterByAccess(actionButtons)}
              dataSource={tableQuery?.data?.data}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
              columns={columns}
              rowActions={filterByAccess(rowActions)}
              rowSelection={isSelectionVisible && {
                type: 'radio',
                selectedRowKeys: selectedRows,
                onChange: (key: Key[]) => {
                  setSelectedRows(key)
                }
              }}
              rowKey='id'
            />
            { isEdgeSubInterfaceCSVEnabled &&
              <ImportFileDrawer
                type={ImportFileDrawerType.EdgeSubInterface}
                title={$t({ defaultMessage: 'Import from file' })}
                maxSize={CsvSize['5MB']}
                acceptType={['csv']}
                templateLink={importTemplateLink}
                visible={importModalvisible}
                isLoading={(uploadResult as UploadResultType).isLoading}
                importError={(uploadResult as UploadResultType).error}
                importRequest={importSubInterfaces}
                onClose={() => setImportModalvisible(false)}
              />}
          </Loader>
        </Col>
      </Row>
    </>
  )
}