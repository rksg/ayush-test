import { useState } from 'react'

import { Col, Row } from 'antd'
import _            from 'lodash'
import { useIntl }  from 'react-intl'

import { Table, TableProps, Tooltip, showActionModal }                                                                                from '@acx-ui/components'
import { EdgeLag, EdgeLagStatus, EdgePort, EdgeSerialNumber, defaultSort, getEdgePortDisplayName, getEdgePortIpModeString, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                                                  from '@acx-ui/user'

import { LagDrawer } from './LagDrawer'

interface EdgeLagTableType extends EdgeLag {
  adminStatus: string
}

interface EdgeLagTableProps {
  clusterId?: string
  serialNumber?: EdgeSerialNumber
  lagList?: EdgeLag[]
  lagStatusList?: EdgeLagStatus[]
  portList?: EdgePort[]
  onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>
  onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>
  onDelete: (serialNumber: string, id: string) => Promise<void>
}

export const EdgeLagTable = (props: EdgeLagTableProps) => {
  const {
    clusterId='',
    serialNumber = '',
    lagList, lagStatusList, portList,
    onAdd, onEdit, onDelete
  } = props
  const { $t } = useIntl()
  const [lagDrawerVisible, setLagDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeLag>()

  const transToTableData = (edgeLagList?: EdgeLag[], edgeLagStatusList?: EdgeLagStatus[]) => {
    return edgeLagList?.map(item => ({
      ...item,
      adminStatus: edgeLagStatusList?.find(status => status.lagId === item.id)?.adminStatus ?? ''
    })) ?? []
  }

  const columns: TableProps<EdgeLagTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'id',
      dataIndex: 'id',
      render: (_data, row) => {
        return `LAG ${row.id}`
      },
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('id', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description',
      sorter: { compare: sortProp('description', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'LAG Type' }),
      key: 'lagType',
      dataIndex: 'lagType',
      render: (_data, row) => {
        return `${row.lagType} (${_.capitalize(row.lacpMode)})`
      },
      sorter: { compare: sortProp('lagType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (_data, row) => {
        const lagMemberSize = row.lagMembers?.length ?? 0
        return lagMemberSize > 0 ?
          <Tooltip
            title={getToolTipContent(row.lagMembers)}
            children={lagMemberSize}
          /> :
          0
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      sorter: { compare: sortProp('portType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      render: (_data, { ipMode }) => getEdgePortIpModeString($t, ipMode),
      sorter: { compare: sortProp('ipMode', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: { compare: sortProp('ip', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet',
      sorter: { compare: sortProp('subnet', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      render: (_data, row) => {
        return row.adminStatus ? row.adminStatus :
          row.lagEnabled ? $t({ defaultMessage: 'Enabled' }) : $t({ defaultMessage: 'Disabled' })
      },
      sorter: { compare: sortProp('adminStatus', defaultSort) }
    }
  ]

  const getToolTipContent = (
    lagMembers: {
      portId: string,
      portEnabled: boolean
    }[]
  ) => {
    return lagMembers?.map(
      lagmember =>
        <Row>
          <Col>
            {
              `${getEdgePortDisplayName((portList?.find(port =>
                port.id === lagmember.portId)))} (${lagmember.portEnabled ?
                $t({ defaultMessage: 'Enabled' }) :
                $t({ defaultMessage: 'Disabled' })})`
            }
          </Col>
        </Row>

    )
  }

  const openDrawer = (data?: EdgeLagTableType) => {
    setCurrentEditData(data)
    setLagDrawerVisible(true)
  }

  const actionButtons = [
    {
      label: $t({ defaultMessage: 'Add LAG' }),
      onClick: () => {
        openDrawer()
      },
      disabled: (lagList?.length ?? 0) >= 4
    }
  ]

  const rowActions: TableProps<EdgeLagTableType>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows) => {
        openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        const targetData = rows[0]
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'LAG' }),
            entityValue: `LAG ${targetData.id}`,
            numOfEntities: rows.length
          },
          onOk: () => {
            onDelete(serialNumber, targetData.id.toString()).then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <>
      <Table<EdgeLagTableType>
        actions={filterByAccess(actionButtons)}
        dataSource={transToTableData(lagList, lagStatusList)}
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && {
          type: 'radio'
        }}
        rowKey='id'
      />
      <LagDrawer
        clusterId={clusterId}
        serialNumber={serialNumber}
        visible={lagDrawerVisible}
        setVisible={setLagDrawerVisible}
        data={currentEditData}
        portList={portList}
        existedLagList={lagList}
        onAdd={onAdd}
        onEdit={onEdit}
      />
    </>
  )
}