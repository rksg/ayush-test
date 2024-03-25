import { useState } from 'react'

import { cloneDeep } from 'lodash'
import { useIntl }   from 'react-intl'

import { Table, TableProps }         from '@acx-ui/components'
import { EdgeStaticRoute }           from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { StaticRoutesDrawer } from './StaticRoutesDrawer'

interface EdgeStaticRouteTableProps {
  value?: EdgeStaticRoute[]
  onChange?: (value: EdgeStaticRoute[]) => void
}

export const EdgeStaticRouteTable = (props: EdgeStaticRouteTableProps) => {
  const { value = [], onChange } = props
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeStaticRoute>()

  const columns: TableProps<EdgeStaticRoute>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Address' }),
      key: 'destIp',
      dataIndex: 'destIp'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'destSubnet',
      dataIndex: 'destSubnet'
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'nextHop',
      dataIndex: 'nextHop'
    }
  ]

  const rowActions: TableProps<EdgeStaticRoute>['rowActions'] = [
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
        onChange?.(value.filter(item => {
          for(let deletedItem of selectedRows) {
            if(deletedItem.id === item.id) {
              return false
            }
          }
          return true
        }))
        clearSelection()
      }
    }
  ]

  const openDrawer = (data?: EdgeStaticRoute) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const actionButtons = [
    { label: $t({ defaultMessage: 'Add Route' }), onClick: () => openDrawer() }
  ]

  const addRoute = (data: EdgeStaticRoute) => {
    onChange?.([...value, data])
  }

  const editRoute = (data: EdgeStaticRoute) => {
    const editIndex = value.findIndex(item => item.id === data.id)
    const newRoutesData = cloneDeep(value)
    newRoutesData[editIndex] = data
    onChange?.([...newRoutesData])
  }

  return (
    <>
      <StaticRoutesDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        addRoute={addRoute}
        editRoute={editRoute}
        data={currentEditData}
        allRoutes={value}
      />
      <Table<EdgeStaticRoute>
        actions={filterByAccess(actionButtons)}
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        dataSource={value}
        rowSelection={hasAccess() && { type: 'checkbox' }}
        rowKey='id'
      />
    </>
  )
}