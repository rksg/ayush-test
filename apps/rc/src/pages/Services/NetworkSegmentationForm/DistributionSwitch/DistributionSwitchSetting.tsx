import React, { useContext, useState, useEffect } from 'react'

import { Col, Form, Input, InputNumber, ModalProps, Row, Select, Space, Transfer } from 'antd'
import { useIntl }                                                                 from 'react-intl'

import { Button, Drawer, Modal, StepsForm, Subtitle, Table, TableProps } from '@acx-ui/components'
import {
  useGetAccessSwitchesQuery,
  useGetDistributionSwitchesQuery,
  useGetAvailableSwitchesQuery
} from '@acx-ui/rc/services'
import {
  AccessSwitch,
  DistributionSwitch,
  networkWifiIpRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


import NetworkSegmentationFormContext from '../NetworkSegmentationFormContext'


export default function DistributionSwitchSetting () {
  const { $t } = useIntl()

  const [openDrawer, setOpenDrawer] = useState(false)
  const [selected, setSelected] = useState<DistributionSwitch>()

  const rowActions: TableProps<DistributionSwitch>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows) => {
      setSelected(selectedRows[0])
      setOpenDrawer(true)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (selectedRows, clearSelection) => {
      clearSelection()
    }
  }]

  const addHandler = () => {
    setSelected(undefined)
    setOpenDrawer(true)
  }

  return (<>
    <Button type='link' style={{ float: 'right' }} onClick={addHandler}>
      { $t({ defaultMessage: 'Add Distribution Switch' }) }
    </Button>
    <StepsForm.Title>
      {$t({ defaultMessage: 'Distribution Switch Settings' })}
    </StepsForm.Title>
    <DistributionSwitchTable rowActions={rowActions}
      selectedRowKeys={selected ? [selected.id] : []}/>
    <DistributionSwitchDrawer
      open={openDrawer}
      editRecord={selected}
      onClose={()=>setOpenDrawer(false)} />
  </>)
}

function DistributionSwitchDrawer (props: {
  open: boolean,
  editRecord?: DistributionSwitch,
  onClose: ()=>void
}) {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const { open, editRecord, onClose } = props

  const defaultRecord = { siteKeepAlive: 5, siteRetry: 3 }

  const { saveState } = useContext(NetworkSegmentationFormContext)
  const venueId = saveState.venueId

  const [openModal, setOpenModal] = useState(false)

  const { data: availableSwitches } = useGetAvailableSwitchesQuery({
    params: { tenantId, venueId }
  }, { skip: !venueId })

  useEffect(()=>{
    form.resetFields()
  }, [form, open])

  return (
    <Drawer
      title={editRecord ?
        $t({ defaultMessage: 'Edit Distribution Switch' }) :
        $t({ defaultMessage: 'Add Distribution Switch' })}
      visible={open}
      mask={true}
      onClose={onClose}
      destroyOnClose={true}
      width={450}
      footer={<Drawer.FormFooter
        onCancel={onClose}
        onSave={async () => {
          try {
            await form.validateFields()
            form.submit()
            onClose()
          } catch (error) {
            if (error instanceof Error) throw error
          }
        }}
      />} >
      <Form form={form}
        layout='vertical'
        initialValues={editRecord || defaultRecord}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Distribution Switch' })}
          rules={[{ required: true }]} >
          <Select placeholder={$t({ defaultMessage: 'Select ...' })}
            options={availableSwitches?.switchViewList?.map(item => ({
              value: item.id,
              label: item.name
            }))
            } />
        </Form.Item>
        <Form.Item name='vlanList'
          label={$t({ defaultMessage: 'VLAN Range' })}
          rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceId'
          label={$t({ defaultMessage: 'Lookback Interface ID' })}
          rules={[{ required: true }, { type: 'number', max: 64, min: 1, transform: Number }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceIpAddress'
          label={$t({ defaultMessage: 'Lookback Interface IP Address' })}
          rules={[{ required: true }, { validator: (_, value) => networkWifiIpRegExp(value) }]}>
          <Input />
        </Form.Item>
        <Form.Item name='loopbackInterfaceSubnetMask'
          label={$t({ defaultMessage: 'Lookback Interface Subnet Mask' })}
          rules={[{ required: true }, { validator: (_, value) => subnetMaskIpRegExp(value) }]}>
          <Input />
        </Form.Item>
        <Space size={10} align='start'>
          <Form.Item name='siteKeepAlive'
            label={$t({ defaultMessage: 'Keep Alive' })}
            rules={[{ required: true }]}>
            <InputNumber style={{ width: '200px' }} max={20} min={1} />
          </Form.Item>
          <Form.Item name='siteRetry'
            label={$t({ defaultMessage: 'Retry Times' })}
            rules={[{ required: true }]}>
            <InputNumber style={{ width: '200px' }} max={5} min={1} />
          </Form.Item>
        </Space>
        <Row justify='space-between' style={{ padding: '30px 0 10px' }}>
          <Col>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Select Access Switches' }) }
            </Subtitle>
          </Col>
          <Col>
            <Button type='link' onClick={()=>setOpenModal(true)}>
              { $t({ defaultMessage: 'Select' }) }
            </Button>
          </Col>
        </Row>
        <Table
          columns={[{
            title: $t({ defaultMessage: 'Access Switch' }),
            dataIndex: 'name',
            key: 'name'
          }, {
            title: $t({ defaultMessage: 'Model' }),
            dataIndex: 'model',
            key: 'model'
          },{
            title: $t({ defaultMessage: 'Uplink Port' }),
            dataIndex: ['uplinkInfo', 'uplinkId'],
            key: 'uplinkInfo'
          }]}
          dataSource={[{
            id: 'ccc',
            name: 'ccc',
            vlanId: 321,
            model: 'sad',
            uplinkInfo: {
              uplinkType: 'PORT',
              uplinkId: '1/3/2'
            }
          }]}
          type='form'
          rowKey='id' />
      </Form>
      <SelectAccessSwitchModal visible={openModal} onCancel={()=>setOpenModal(false)} />
    </Drawer>
  )
}

function SelectAccessSwitchModal (props: ModalProps) {
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const { saveState } = useContext(NetworkSegmentationFormContext)
  const venueId = saveState.venueId

  const [selectedAsList, setSelectedAsList] = useState([] as string[])

  const { data } = useGetAccessSwitchesQuery({ params: { tenantId, venueId } }, { skip: !venueId })

  const handleUpdateAsList = () => {}
  const handleChange = (targetKeys: string[]) => {
    setSelectedAsList(targetKeys)
  }

  return (
    <Modal {...props}
      title={$t({ defaultMessage: 'Select Access Switches' })}
      okText={$t({ defaultMessage: 'Apply' })}
      onOk={handleUpdateAsList}
      okButtonProps={{
        disabled: selectedAsList.length <= 0
      }}
      width={662} >
      <Transfer
        dataSource={data?.data}
        targetKeys={selectedAsList}
        showSearch
        showSelectAll={false}
        listStyle={{ width: 250, height: 300 }}
        titles={[
          $t({ defaultMessage: 'Available Access Switch' }),
          $t({ defaultMessage: 'Applied Profiles' })
        ]}
        operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
        onChange={handleChange}
        render={item => `${item.name} (${item.id})`}
      />
    </Modal>)
}

function DistributionSwitchTable (
  props: {
    rowActions: TableProps<DistributionSwitch>['rowActions'],
    selectedRowKeys: string[]
  }
) {
  const { $t } = useIntl()

  const { rowActions, selectedRowKeys } = props

  const columns: TableProps<DistributionSwitch>['columns'] = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Dist. Switch' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    }, {
      key: 'vlanList',
      title: $t({ defaultMessage: 'VLAN Range' }),
      dataIndex: 'vlanList',
      sorter: true
    }, {
      key: 'accessSwitches',
      title: $t({ defaultMessage: 'Access Switch' }),
      dataIndex: 'accessSwitches',
      sorter: true
    }, {
      key: 'loopbackInterface',
      title: $t({ defaultMessage: 'Loopback Interface' }),
      dataIndex: 'loopbackInterface',
      children: [{
        key: 'loopbackInterfaceId',
        title: <Table.SubTitle>{$t({ defaultMessage: 'ID' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceId'
      }, {
        key: 'loopbackInterfaceIpAddress',
        title: <Table.SubTitle>{$t({ defaultMessage: 'IP Address' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceIpAddress'
      }, {
        key: 'loopbackInterfaceSubnetMask',
        title: <Table.SubTitle>{$t({ defaultMessage: 'Subnet Mask' })}</Table.SubTitle>,
        dataIndex: 'loopbackInterfaceSubnetMask'
      }]
    }, {
      key: 'siteKeepAlive',
      title: $t({ defaultMessage: 'Keep Alive' }),
      dataIndex: 'siteKeepAlive',
      sorter: true
    }, {
      key: 'siteRetry',
      title: $t({ defaultMessage: 'Retry Times' }),
      dataIndex: 'siteRetry',
      sorter: true
    }]
  }, [$t])
  return (<>
    <Table
      columns={columns}
      dataSource={[{
        id: 'xxx',
        name: 'xxx',
        siteName: 'xxx',
        siteIpAddress: 'xxx',
        vlanList: 'xxx',
        siteKeepAlive: 'xxx',
        siteRetry: 'xxx',
        loopbackInterfaceId: 'xxx',
        loopbackInterfaceIpAddress: 'xxx',
        loopbackInterfaceSubnetMask: 'xxx'
      }]}
      // pagination={tableQuery.pagination}
      // onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowActions={rowActions}
      rowSelection={{ type: 'radio', selectedRowKeys }} />
    <br />
  </>)
}
