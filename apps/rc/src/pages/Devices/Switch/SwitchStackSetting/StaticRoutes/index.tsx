import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Button }                                  from '@acx-ui/components'
import { hasAccesses }                                                        from '@acx-ui/rbac'
import { useGetSwitchStaticRoutesQuery, useDeleteSwitchStaticRoutesMutation } from '@acx-ui/rc/services'
import { StaticRoute }                                                        from '@acx-ui/rc/utils'

import StaticRoutesDrawer from './StaticRoutesDrawer'

const StaticRoutes = (props: { readOnly: boolean }) => {

  const { $t } = useIntl()
  const params = useParams()
  const { readOnly } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<StaticRoute>()
  const { data, isFetching: isDataFetching }= useGetSwitchStaticRoutesQuery({ params: params })
  const [deleteSwitchStaticRoutes] = useDeleteSwitchStaticRoutesMutation()

  useEffect(() => {
  }, [data])

  const columns: TableProps<StaticRoute>['columns'] = [
    {
      title: $t({ defaultMessage: 'ID' }),
      key: 'id',
      dataIndex: 'id',
      show: false
    },{
      title: $t({ defaultMessage: 'Destination IP' }),
      key: 'destinationIp',
      dataIndex: 'destinationIp'
    },
    {
      title: $t({ defaultMessage: 'Next Hop' }),
      key: 'nextHop',
      dataIndex: 'nextHop'
    },
    {
      title: $t({ defaultMessage: 'Admin Distance' }),
      key: 'adminDistance',
      dataIndex: 'adminDistance'
    }
  ]

  const rowActions: TableProps<StaticRoute>['rowActions'] = [
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
        deleteSwitchStaticRoutes({ params, payload: selectedRows.map(item => item.id) })
        clearSelection()
      }
    }
  ]

  const openDrawer = (data?: StaticRoute) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const toolBarRender = () => [
    <Button type='link' onClick={() => openDrawer()}>
      {$t({ defaultMessage: 'Add Rule' })}
    </Button>
  ]

  return (
    <Loader states={[
      {
        isLoading: false,
        isFetching: isDataFetching
      }
    ]}>
      <StaticRoutesDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={currentEditData}
      />
      <Table<StaticRoute>
        headerTitle={$t({ defaultMessage: 'Static Routes' })}
        toolBarRender={readOnly ? undefined : toolBarRender}
        columns={columns}
        rowActions={readOnly ? undefined : hasAccesses(rowActions)}
        dataSource={data}
        rowSelection={readOnly ? undefined : { type: 'checkbox' }}
        rowKey='id'
        type='form'
      />
    </Loader>
  )
}

export default StaticRoutes
