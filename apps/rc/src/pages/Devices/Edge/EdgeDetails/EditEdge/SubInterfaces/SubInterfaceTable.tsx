import { Key, useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Col, Row }            from 'antd'
import { useIntl }             from 'react-intl'

import { Loader, Table, TableProps, showActionModal }      from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '@acx-ui/rc/components'
import { EdgeSubInterface, TableQuery }                    from '@acx-ui/rc/utils'
import { RequestPayload }                                  from '@acx-ui/types'
import { filterByAccess, hasAccess }                       from '@acx-ui/user'

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
  const isEdgeSubInterfaceCSVEnabled = useIsSplitOn(Features.EDGES_SUB_INTERFACE_CSV_TOGGLE)
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
    }
  ]

  const rowActions: TableProps<EdgeSubInterface>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        openDrawer(selectedRows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
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
      onClick: () => openDrawer()
    },
    ...(isEdgeSubInterfaceCSVEnabled ? [{
      label: $t({ defaultMessage: 'Import from file' }),
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
        <Col span={12}>
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
              rowSelection={hasAccess() && {
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