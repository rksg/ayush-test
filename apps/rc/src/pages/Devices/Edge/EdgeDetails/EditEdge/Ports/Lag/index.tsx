import { useState } from 'react'

import { Col, Row }  from 'antd'
import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Tooltip, showActionModal }                     from '@acx-ui/components'
import { useDeleteEdgeLagMutation, useGetEdgeLagListQuery }                        from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgeLag, EdgeLagStatus, EdgePort, defaultSort, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                               from '@acx-ui/user'

import { LagDrawer } from './LagDrawer'

interface LagProps {
  lagStatusList: EdgeLagStatus[]
  isLoading: boolean
  portList?: EdgePort[]
}

interface EdgeLagTableType extends EdgeLag {
  adminStatus: string
}

const Lag = (props: LagProps) => {

  const { lagStatusList, isLoading, portList } = props
  const { serialNumber } = useParams()
  const { $t } = useIntl()
  const [lagDrawerVisible, setLagDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeLag>()
  const { lagData = [], isLagLoading } = useGetEdgeLagListQuery({
    params: { serialNumber },
    payload: {
      page: 1,
      pageSize: 10
    }
  },{
    selectFromResult ({ data, isLoading, isFetching }) {
      return {
        lagData: data?.data?.map(item => ({
          ...item,
          adminStatus: lagStatusList.find(status => status.lagId === item.id)?.adminStatus ?? ''
        })),
        isLagLoading: isLoading || isFetching
      }
    }
  })
  const [deleteEdgeLag] = useDeleteEdgeLagMutation()

  const columns: TableProps<EdgeLagTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'LAG Name' }),
      key: 'id',
      dataIndex: 'id',
      render: (data, row) => {
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
      render: (data, row) => {
        return `${row.lagType} (${_.capitalize(row.lacpMode)})`
      },
      sorter: { compare: sortProp('lagType', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (data, row) => {
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
      render: (data, { ipMode }) => {
        switch(ipMode) {
          case EdgeIpModeEnum.DHCP:
            return $t({ defaultMessage: 'DHCP' })
          case EdgeIpModeEnum.STATIC:
            return $t({ defaultMessage: 'Static IP' })
          default:
            return ''
        }
      },
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
              `${_.capitalize(portList?.find(port =>
                port.id === lagmember.portId)?.interfaceName ?? '')} (${lagmember.portEnabled ?
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
      disabled: lagData.length >= 4
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
            deleteEdgeLag({ params: {
              serialNumber: serialNumber,
              lagId: targetData.id.toString()
            } }).then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <Loader states={[{ isLoading: false, isFetching: isLoading || isLagLoading }]}>
      <Table<EdgeLagTableType>
        actions={filterByAccess(actionButtons)}
        dataSource={lagData}
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && {
          type: 'radio'
        }}
        rowKey='id'
      />
      <LagDrawer
        visible={lagDrawerVisible}
        setVisible={setLagDrawerVisible}
        data={currentEditData}
        portList={portList}
        existedLagList={lagData}
      />
    </Loader>
  )
}

export default Lag