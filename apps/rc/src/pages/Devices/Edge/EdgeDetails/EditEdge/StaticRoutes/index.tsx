import { useEffect, useState } from 'react'

import { Col, Row, Typography }   from 'antd'
import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, StepsFormLegacy, Table, TableProps }             from '@acx-ui/components'
import { useGetStaticRoutesQuery, useUpdateStaticRoutesMutation } from '@acx-ui/rc/services'
import { EdgeStaticRoute }                                        from '@acx-ui/rc/utils'
import { useTenantLink }                                          from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }                              from '@acx-ui/user'

import StaticRoutesDrawer from './StaticRoutesDrawer'


const StaticRoutes = () => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [routesData, setRoutesData] = useState<EdgeStaticRoute[]>([])
  const [currentEditData, setCurrentEditData] = useState<EdgeStaticRoute>()
  const { data, isFetching: isDataFetching }= useGetStaticRoutesQuery({ params: params })
  const [
    updateStaticRoutes,
    { isLoading: isStaticRoutesUpdating }
  ] = useUpdateStaticRoutesMutation()

  useEffect(() => {
    if(data && data.routes) {
      setRoutesData(data.routes)
    }
  }, [data])

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

  const openDrawer = (data?: EdgeStaticRoute) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const actionButtons = [
    { label: $t({ defaultMessage: 'Add Route' }), onClick: () => openDrawer() }
  ]

  const addRoute = (data: EdgeStaticRoute) => {
    setRoutesData([...routesData, data])
  }

  const editRoute = (data: EdgeStaticRoute) => {
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
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy<void>
      onFinish={handleFinish}
      onCancel={() => navigate(linkToEdgeList)}
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply Static Routes' }) }}
    >
      <StepsFormLegacy.StepForm>
        <Row>
          <Col span={7}>
            <Loader states={[
              {
                isLoading: false,
                isFetching: isDataFetching || isStaticRoutesUpdating
              }
            ]}>
              <StaticRoutesDrawer
                visible={drawerVisible}
                setVisible={setDrawerVisible}
                addRoute={addRoute}
                editRoute={editRoute}
                data={currentEditData}
                allRoutes={routesData}
              />
              <Typography.Title level={3}>
                {$t({ defaultMessage: 'Static Routes' })}
              </Typography.Title>
              <Table<EdgeStaticRoute>
                actions={filterByAccess(actionButtons)}
                columns={columns}
                rowActions={filterByAccess(rowActions)}
                dataSource={routesData}
                rowSelection={hasAccess() && { type: 'checkbox' }}
                rowKey='id'
              />
            </Loader>
          </Col>
        </Row>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}

export default StaticRoutes
