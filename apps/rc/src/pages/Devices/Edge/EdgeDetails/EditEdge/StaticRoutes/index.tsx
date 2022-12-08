import { useState } from 'react'

import {
  Col, Row
} from 'antd'
import { useIntl } from 'react-intl'

import { Loader, StepsForm, Table, TableProps, Button } from '@acx-ui/components'
import { EdgeStaticRoutes }                             from '@acx-ui/rc/utils'

import StaticRoutesDrawer from './StaticRoutesDrawer'


const StaticRoutes = () => {

  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [routesData, setRoutesData] = useState<EdgeStaticRoutes[]>([])
  const [currentEditData, setCurrentEditData] = useState<EdgeStaticRoutes>()

  const columns: TableProps<EdgeStaticRoutes>['columns'] = [
    {
      title: $t({ defaultMessage: 'Network Address' }),
      key: 'networkAddress',
      dataIndex: 'networkAddress'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gateway',
      dataIndex: 'gateway'
    }
  ]

  const rowActions: TableProps<EdgeStaticRoutes>['rowActions'] = [
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
            if(deletedItem.id && deletedItem.id === item.id) {
              return false
            }
            if(deletedItem.networkAddress === item.networkAddress &&
              deletedItem.subnetMask === item.subnetMask) {
              return false
            }
          }
          return true
        }))
        clearSelection()
      }
    }
  ]

  const openDrawer = (data?: EdgeStaticRoutes) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const toolBarRender = () => [
    <Button type='link' onClick={() => openDrawer()}>
      {$t({ defaultMessage: 'Add Route' })}
    </Button>
  ]

  const addRoute = (data: EdgeStaticRoutes) => {
    setRoutesData([...routesData, data])
  }

  return (
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply Static Routes' }) }}
    >
      <StepsForm.StepForm>
        <Row>
          <Col span={7}>
            <Loader>
              <StaticRoutesDrawer
                visible={drawerVisible}
                setVisible={setDrawerVisible}
                addRoute={addRoute}
                data={currentEditData}
              />
              <Table<EdgeStaticRoutes>
                headerTitle={$t({ defaultMessage: 'Set Static Routes' })}
                toolBarRender={toolBarRender}
                columns={columns}
                rowActions={rowActions}
                dataSource={routesData}
                rowSelection={{ type: 'checkbox' }}
                rowKey='networkAddress'
                type='form'
              />
            </Loader>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

export default StaticRoutes