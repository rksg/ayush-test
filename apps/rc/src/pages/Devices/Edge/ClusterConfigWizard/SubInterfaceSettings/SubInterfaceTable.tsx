import { Key, useContext, useEffect, useState } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Table, TableProps, showActionModal, useStepFormContext }                                        from '@acx-ui/components'
import { isInterfaceInVRRPSetting, SubInterface, convertEdgeSubInterfaceToApiPayload, EdgeSubInterface } from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                                    from '@acx-ui/types'
import { filterByAccess, hasPermission }                                                                 from '@acx-ui/user'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import * as UI                        from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'

export interface SubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  namePath: string[]
  onChange?: (data: SubInterface[]) => void
}

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {
  const { $t } = useIntl()
  const { currentTab, ip, mac } = props

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<SubInterface>()
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  const { form } = useStepFormContext()
  const { clusterNetworkSettings } = useContext(ClusterConfigWizardContext)
  const vipSettings = clusterNetworkSettings?.virtualIpSettings

  const closeDrawers = () => {
    setDrawerVisible(false)
  }

  useEffect(() => {
    closeDrawers()
    setSelectedRows([])
  }, [currentTab])

  const columns: TableProps<SubInterface>['columns'] = [
    {
      title: '#',
      key: '',
      dataIndex: 'index',
      width: 50,
      render: (_, __, index) => {
        return index + 1
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

  const isAllowedToDelete = (subInterfaces: SubInterface[]) => {
    return subInterfaces?.[0]
      ? !isInterfaceInVRRPSetting(
        props.serialNumber,
        subInterfaces[0].interfaceName ?? '',
        vipSettings)
      : false
  }

  const rowActions: TableProps<SubInterface>['rowActions'] = [
    {
      scopeKey: [EdgeScopes.UPDATE],
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        openDrawer(selectedRows[0])
      }
    },
    {
      scopeKey: [EdgeScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      disabled: (selectedRows) => !isAllowedToDelete(selectedRows),
      tooltip: (selectedRows) => {
        if(!isAllowedToDelete(selectedRows)) {
          return $t({
            // eslint-disable-next-line max-len
            defaultMessage: 'The selected sub-interface is configured as the virtual IP interface and cannot be deleted'
          })
        }
        return ''
      },
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
      onClick: () => openDrawer(),
      disabled: (form.getFieldValue(props.namePath)?.length ?? 0) >= 16
    }
  ]

  const openDrawer = (data?: SubInterface) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const handleAdd = async (data: SubInterface): Promise<unknown> => {
    const savedData = convertEdgeSubInterfaceToApiPayload(data as EdgeSubInterface)

    form.setFieldValue(
      props.namePath,
      [...form.getFieldValue(props.namePath), savedData])
    props.onChange?.(form.getFieldValue(props.namePath))
    return
  }

  const handleUpdate = async (data: SubInterface): Promise<unknown> => {
    const existingData = form.getFieldValue(props.namePath)
    const savedData = convertEdgeSubInterfaceToApiPayload(data as EdgeSubInterface)

    const updatedData = existingData.map((item: SubInterface) =>
      item.id === data.id ? savedData : item
    )

    form.setFieldValue(props.namePath, updatedData)
    props.onChange?.(form.getFieldValue(props.namePath))
    return
  }

  const handleDelete = async (data: SubInterface): Promise<unknown> => {
    const existingData = form.getFieldValue(props.namePath)
    const updatedData = existingData.filter((item: SubInterface) => item.id !== data.id)
    form.setFieldValue(props.namePath, updatedData)
    props.onChange?.(form.getFieldValue(props.namePath))
    return
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
        <Col span={12}>
          <SubInterfaceDrawer
            serialNumber={props.serialNumber}
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            data={currentEditData}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
            allSubInterfaceVlans={
              (form.getFieldValue(props.namePath) as { id: string, vlan: number }[])
            }
          />
          <Table<SubInterface>
            actions={filterByAccess(actionButtons)}
            dataSource={form.getFieldValue(props.namePath)}
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
        </Col>
      </Row>
    </>
  )
}