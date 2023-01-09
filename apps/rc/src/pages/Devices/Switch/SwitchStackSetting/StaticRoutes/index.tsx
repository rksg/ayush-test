import { useEffect, useState } from 'react'

import {
  Col, Row
} from 'antd'
import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsForm, Table, TableProps, Button, showToast }      from '@acx-ui/components'
import { useGetSwitchStaticRoutesQuery, useUpdateSwitchStaticRoutesMutation } from '@acx-ui/rc/services'
import { EdgeStaticRoute, StaticRoute }                                 from '@acx-ui/rc/utils'
import { useTenantLink }                                                from '@acx-ui/react-router-dom'

import StaticRoutesDrawer from './StaticRoutesDrawer'


const StaticRoutes = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [routesData, setRoutesData] = useState<StaticRoute[]>([])
  const [currentEditData, setCurrentEditData] = useState<StaticRoute>()
  const { data, isFetching: isDataFetching }= useGetSwitchStaticRoutesQuery({ params: params })
  const [
    updateStaticRoutes,
    { isLoading: isStaticRoutesUpdating }
  ] = useUpdateSwitchStaticRoutesMutation()

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
        setRoutesData(routesData.filter(item => {
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

  const openDrawer = (data?: StaticRoute) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const toolBarRender = () => [
    <Button type='link' onClick={() => openDrawer()}>
      {$t({ defaultMessage: 'Add Route' })}
    </Button>
  ]

  const addRoute = (data: StaticRoute) => {
    setRoutesData([...routesData, data])
  }

  const editRoute = (data: StaticRoute) => {
    const editIndex = routesData.findIndex(item => item.id === data.id)
    const newRoutesData = cloneDeep(routesData)
    newRoutesData[editIndex] = data
    setRoutesData([...newRoutesData])
  }

  const handleFinish = async () => {
    try {
      const payload = {
        routes: routesData
      }
      await updateStaticRoutes({ params: params, payload: payload }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <Loader states={[
      {
        isLoading: false,
        isFetching: isDataFetching || isStaticRoutesUpdating
      }
    ]}>
      <StaticRoutesDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        data={currentEditData}
      />
      <Table<StaticRoute>
        headerTitle={$t({ defaultMessage: 'Static Routes' })}
        toolBarRender={toolBarRender}
        columns={columns}
        rowActions={rowActions}
        dataSource={data}
        rowSelection={{ type: 'checkbox' }}
        rowKey='id'
        type='form'
      />
    </Loader>
  )
}

export default StaticRoutes