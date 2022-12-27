import { Key, useContext, useEffect, useState } from 'react'

import { Col, Row }  from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, ContentSwitcher, ContentSwitcherProps, Loader, showActionModal, Table, TableProps } from '@acx-ui/components'
import { useDeleteSubInterfacesMutation, useGetSubInterfacesQuery }                                  from '@acx-ui/rc/services'
import { EdgeSubInterface, useGetTableQuery }                                                        from '@acx-ui/rc/utils'

import { PortsContext } from '..'
import * as UI          from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'


interface SubInterfaceTableProps {
  index: number
  mac: string
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>
}

const SubInterfaceTable = (props: SubInterfaceTableProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeSubInterface>()
  const [selectedRows, setSelectedRows] = useState<Key[]>([])
  const tableQuery = useGetTableQuery<EdgeSubInterface>({
    useQuery: useGetSubInterfacesQuery,
    apiParams: { mac: props.mac }
  })
  const [deleteSubInterfaces] = useDeleteSubInterfacesMutation()

  useEffect(() => {
    setSelectedRows([])
  }, [props.mac])

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
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Sub-Interface' }),
            entityValue: selectedRows[0].vlan.toString(),
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            deleteSubInterfaces({
              params: {
                ...params,
                mac: props.mac,
                subInterfaceId: selectedRows[0].id }
            }).then(clearSelection)
          }
        })
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
            { ip: '', mac: props.mac }
          )
        }
      </UI.IpAndMac>
      <Row>
        <Col span={8}>
          <SubInterfaceDrawer
            index={props.index}
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            data={currentEditData}
          />
          <Loader states={[tableQuery]}>
            <Table<EdgeSubInterface>
              toolBarRender={toolBarRender}
              dataSource={tableQuery?.data?.content}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
              columns={columns}
              rowActions={rowActions}
              rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedRows,
                onChange: (key: Key[]) => {
                  setSelectedRows(key)
                }
              }}
              rowKey='id'
              type='form'
            />
          </Loader>
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
          children: <SubInterfaceTable
            index={index}
            mac={data.mac}
            setIsFetching={setIsFetching} />
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