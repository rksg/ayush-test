import { Key, ReactNode, useContext, useEffect, useState } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { showActionModal, Table, TableProps }                                                                          from '@acx-ui/components'
import { Features }                                                                                                    from '@acx-ui/feature-toggle'
import { CheckMark }                                                                                                   from '@acx-ui/icons'
import { useIsEdgeFeatureReady }                                                                                       from '@acx-ui/rc/components'
import { convertEdgeSubInterfaceToApiPayload, EdgePortInfo, EdgeSubInterface, isInterfaceInVRRPSetting, SubInterface } from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                                                  from '@acx-ui/types'
import { filterByAccess, hasPermission }                                                                               from '@acx-ui/user'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import * as UI                        from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'

export interface SubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  value?: SubInterface[]
  onChange?: (data: SubInterface[]) => void
  allInterface?: EdgePortInfo[]
  currentInterfaceName?: string
}

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {
  const { $t } = useIntl()
  const {
    currentTab, ip, mac, value = [], onChange, allInterface = [], currentInterfaceName
  } = props

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<SubInterface>()
  const [selectedRows, setSelectedRows] = useState<Key[]>([])
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

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
    },
    ...(
      isEdgeCoreAccessSeparationReady ?
        [
          {
            title: $t({ defaultMessage: 'Core Port' }),
            align: 'center' as const,
            key: 'corePortEnabled',
            dataIndex: 'corePortEnabled',
            render: (_data: ReactNode, row: SubInterface) => {
              return row.corePortEnabled && <CheckMark width={20} height={20} />
            }
          },
          {
            title: $t({ defaultMessage: 'Access Port' }),
            align: 'center' as const,
            key: 'accessPortEnabled',
            dataIndex: 'accessPortEnabled',
            render: (_data: ReactNode, row: SubInterface) => {
              return row.accessPortEnabled && <CheckMark width={20} height={20} />
            }
          }
        ]
        : []
    )
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
            handleDelete(selectedRows[0])
            clearSelection()
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
      disabled: (value?.length ?? 0) >= 16
    }
  ]

  const openDrawer = (data?: SubInterface) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const handleAdd = (data: SubInterface) => {
    const savedData = convertEdgeSubInterfaceToApiPayload(data as EdgeSubInterface)
    onChange?.([...value, { ...savedData, interfaceName: `${currentInterfaceName}.${data.vlan}` }])
  }

  const handleUpdate = (data: SubInterface) => {
    const savedData = convertEdgeSubInterfaceToApiPayload(data as EdgeSubInterface)
    const updatedData = value?.map((item: SubInterface) =>
      item.id === data.id ?
        { ...savedData, interfaceName: `${currentInterfaceName}.${data.vlan}` } :
        item
    )
    onChange?.(updatedData)
  }

  const handleDelete = (data: SubInterface) => {
    const updatedData = value?.filter((item: SubInterface) => item.id !== data.id)
    onChange?.(updatedData)
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
        <Col span={18}>
          <SubInterfaceDrawer
            serialNumber={props.serialNumber}
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            data={currentEditData}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
            allSubInterfaceVlans={
              (value as { id: string, vlan: number }[])
            }
            allInterface={allInterface}
          />
          <Table<SubInterface>
            actions={filterByAccess(actionButtons)}
            dataSource={value}
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