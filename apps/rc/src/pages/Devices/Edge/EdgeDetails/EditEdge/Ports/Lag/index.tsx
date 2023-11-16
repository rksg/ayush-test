import { useState } from 'react'

import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, showActionModal }       from '@acx-ui/components'
import { useDeleteEdgeLagMutation, useGetEdgeLagListQuery } from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgeLag, EdgeLagStatus, EdgePort } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                        from '@acx-ui/user'

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
      pag: 1,
      pageSize: 10
    }
  },{
    selectFromResult ({ data, isLoading }) {
      return {
        lagData: data?.data?.map(item => ({
          ...item,
          adminStatus: lagStatusList.find(status => status.lagId === item.id)?.adminStatus ?? ''
        })),
        isLagLoading: isLoading
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
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'description'
    },
    {
      title: $t({ defaultMessage: 'LAG Type' }),
      key: 'lagType',
      dataIndex: 'lagType',
      render: (data, row) => {
        return `${row.lagType} (${_.capitalize(row.lacpMode)})`
      }
    },
    {
      title: $t({ defaultMessage: 'LAG Members' }),
      key: 'lagMembers',
      dataIndex: 'lagMembers',
      render: (data, row) => {
        return row.lagMembers?.length
      },
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType'
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
      }
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
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
    }
  ]

  const openDrawer = (data?: EdgeLagTableType) => {
    setCurrentEditData(data)
    setLagDrawerVisible(true)
  }

  const actionButtons = [
    {
      label: $t({ defaultMessage: 'Add LAG' }),
      onClick: () => {
        openDrawer()
      }
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
      />
    </Loader>
  )
}

export default Lag