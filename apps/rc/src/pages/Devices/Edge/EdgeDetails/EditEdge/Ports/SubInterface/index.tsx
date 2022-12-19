import { useContext, useEffect, useState } from 'react'

import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, ContentSwitcher, ContentSwitcherProps, Loader, Table, TableProps } from '@acx-ui/components'
import { EdgeSubInterface }                                                         from '@acx-ui/rc/utils'

import { PortsContext } from '..'
import * as UI          from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'


interface SubInterfaceTableProps {
  ip: string
  mac: string
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>
}

const SubInterfaceTable = (props: SubInterfaceTableProps) => {

  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [routesData, setRoutesData] = useState<EdgeSubInterface[]>([])
  const [currentEditData, setCurrentEditData] = useState<EdgeSubInterface>()

  const columns: TableProps<EdgeSubInterface>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType'
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode'
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

  const rowActions: TableProps<EdgeSubInterface>['rowActions'] = [
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
            // if(deletedItem.networkAddress === item.networkAddress &&
            //   deletedItem.subnetMask === item.subnetMask) {
            //   return false
            // }
          }
          return true
        }))
        clearSelection()
      }
    }
  ]

  const openDrawer = (data?: EdgeSubInterface) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const toolBarRender = () => [
    <Button type='link' onClick={() => openDrawer()}>
      {$t({ defaultMessage: 'Add Route' })}
    </Button>
  ]

  return (
    <>
      <UI.IpAndMac>
        {
          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: props.ip, mac: props.mac }
          )
        }
      </UI.IpAndMac>
      <Row>
        <Col span={8}>
          <SubInterfaceDrawer
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            // addRoute={addRoute}
            data={currentEditData}
          />
          <Table<EdgeSubInterface>
            toolBarRender={toolBarRender}
            columns={columns}
            rowActions={rowActions}
            dataSource={routesData}
            rowSelection={{ type: 'checkbox' }}
            rowKey='networkAddress'
            type='form'
          />
        </Col>
      </Row>
    </>
  )
}

const SubInterface = () => {
  const { $t } = useIntl()
  const { ports } = useContext(PortsContext)
  const [tabDetails, setTabDetails] = useState<ContentSwitcherProps['tabDetails']>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if(ports) {
      setTabDetails(ports.map((data, index) => {
        return {
          label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
          value: 'port_' + (index + 1),
          children: <SubInterfaceTable ip={data.ip} mac={data.mac} setIsFetching={setIsFetching} />
        }
      }))
    }
  }, [ports, $t])

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isFetching
    }]}>
      <ContentSwitcher
        tabDetails={tabDetails}
        defaultValue={'port_1'}
        size='large'
        align='left'
      />
    </Loader>
  )
}

export default SubInterface