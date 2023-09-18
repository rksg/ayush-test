import { useEffect, useMemo, useState } from 'react'

import { Col, Divider, Form, Input, InputNumber, Row, Space } from 'antd'
import { useIntl }                                            from 'react-intl'

import { Button, Drawer, Subtitle, Table, TableProps } from '@acx-ui/components'
import { useLazyGetDhcpServerQuery }                   from '@acx-ui/rc/services'
import {
  getDhcpOptionList,
  networkWifiIpRegExp,
  serverIpAddressRegExp,
  subnetMaskIpRegExp,
  SwitchDhcp,
  SwitchDhcpOption
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { DhcpOptionModal } from './DhcpOptionModal'

export function AddPoolDrawer (props: {
  visible: boolean,
  isLoading?: boolean,
  editPoolId?: SwitchDhcp['id'],
  onSavePool?: (values: SwitchDhcp)=>void,
  onClose?: ()=>void
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const params = useParams()
  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<SwitchDhcpOption>()
  const [dhcpOptionList, setDhcpOptionList] = useState<SwitchDhcpOption[]>()

  const DHCP_OPTIONS = useMemo(() => getDhcpOptionList(), [])

  const [ getDhcpServer ] = useLazyGetDhcpServerQuery()

  useEffect(()=>{
    form.resetFields()
    setSelected(undefined)
    setDhcpOptionList([])
    if(props.visible && props.editPoolId) {
      getDhcpServer({
        params: {
          tenantId: params.tenantId,
          dhcpServerId: props.editPoolId
        }
      }).unwrap().then(value => {
        form.setFieldsValue(value)
        setDhcpOptionList(value.dhcpOptions)
      })
    }
  }, [form, props.visible, props.editPoolId, params.tenantId])

  const onSaveOption = (values: SwitchDhcpOption) => {
    const newList = dhcpOptionList || []
    if (!selected) { // Add
      setDhcpOptionList(newList.concat(values))
    }
    else { // edit
      setDhcpOptionList(newList.map(option => {
        if (selected.seq === option.seq) {
          return { ...selected, ...values }
        }
        return option
      }))
    }
    setSelected(undefined)
    setOpenModal(false)
  }

  const handleFormFinish = (values: SwitchDhcp) => {
    props.onSavePool && props.onSavePool({ ...values, dhcpOptions: dhcpOptionList })
  }

  const rowActions: TableProps<SwitchDhcpOption>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setSelected(selectedRows[0])
        setOpenModal(true)
      }
    }, {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows) => {
        setDhcpOptionList(dhcpOptionList?.filter(option=>{
          return !selectedRows.map(r=>r.seq).includes(option.seq)
        }))
        setSelected(undefined)
      }
    }
  ]

  const columns: TableProps<SwitchDhcpOption>['columns'] = [
    {
      title: $t({ defaultMessage: 'Option ID' }),
      dataIndex: 'seq',
      key: 'seq'
    }, {
      title: $t({ defaultMessage: 'Option Name' }),
      dataIndex: 'seq',
      key: 'seq',
      render: (_, row) => DHCP_OPTIONS[row.seq as keyof typeof DHCP_OPTIONS].label
    }, {
      title: $t({ defaultMessage: 'Format' }),
      dataIndex: 'type',
      key: 'type'
    }, {
      title: $t({ defaultMessage: 'Value' }),
      dataIndex: 'value',
      key: 'value'
    }
  ]

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='dhcp-pool-footer'>
      <Button onClick={props?.onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        loading={props.isLoading}
        onClick={() => form.submit()}
        type='primary'
      >
        {$t({ defaultMessage: 'Save' })}
      </Button>
    </Space>
  ]

  return (<>
    <Drawer
      title={props.editPoolId?
        $t({ defaultMessage: 'Edit DHCP Pool' }):
        $t({ defaultMessage: 'Add DHCP Pool' })}
      visible={props.visible}
      onClose={props.onClose}
      closable={true}
      width={460}
      footer={footer}
    >
      <Form layout='vertical' form={form} onFinish={handleFormFinish}>
        <Form.Item name={'id'} hidden children={<></>} />
        <Form.Item
          name='poolName'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[{ required: true }, { type: 'string', min: 1, max: 127 }]}
          children={<Input
            onChange={({ target }) => {
              form.setFieldValue('poolName', target.value.toLowerCase())
            }} />}
        />
        <Form.Item
          name='subnetAddress'
          label={$t({ defaultMessage: 'Subnet Address' })}
          rules={[{ required: true }, { validator: (_, value) => networkWifiIpRegExp(value) }]}
          children={<Input />}
        />
        <Form.Item
          name='subnetMask'
          label={$t({ defaultMessage: 'Subnet Mask' })}
          rules={[{ required: true }, { validator: (_, value) => subnetMaskIpRegExp(value) }]}
          children={<Input />}
        />
        <Form.Item label={$t({ defaultMessage: 'Excluded Range' })} style={{ marginBottom: 0 }}>
          <Space align='start'>
            <Form.Item
              name='excludedStart'
              rules={[{ validator: (_, value) => serverIpAddressRegExp(value) }]}
              children={<Input />}
            />
            <Divider style={{ width: '5px' }}/>
            <Form.Item
              name='excludedEnd'
              rules={[{ validator: (_, value) => serverIpAddressRegExp(value) }]}
              children={<Input />}
            />
          </Space>
        </Form.Item>
        <Form.Item label={$t({ defaultMessage: 'Lease Time' })}
          style={{ marginBottom: 0 }}
          required >
          <Space align='start'>
            <Form.Item
              name='leaseDays'
              label={$t({ defaultMessage: 'Days' })}
              rules={[{ required: true }]}
              required={false}
              initialValue={1}
              children={<InputNumber min={0} max={365} />}
            />
            <Form.Item
              name='leaseHrs'
              label={$t({ defaultMessage: 'Hours' })}
              rules={[{ required: true }]}
              required={false}
              initialValue={0}
              children={<InputNumber min={0} />}
            />
            <Form.Item
              name='leaseMins'
              label={$t({ defaultMessage: 'Minutes' })}
              rules={[{ required: true }]}
              required={false}
              initialValue={0}
              children={<InputNumber min={0} max={65535} />}
            />
          </Space>
        </Form.Item>
        <Form.Item
          name='defaultRouterIp'
          label={$t({ defaultMessage: 'Default Router IP' })}
          rules={[{ validator: (_, value) => serverIpAddressRegExp(value) }]}
          children={<Input />}
        />
        <Row justify='space-between' style={{ margin: '25px 0 10px' }}>
          <Col>
            <Subtitle level={4}>
              { $t({ defaultMessage: 'Add DHCP options' }) }
            </Subtitle>
          </Col>
          <Col>
            <Button type='link'
              onClick={()=>{
                setSelected(undefined)
                setOpenModal(true)
              }}>
              { $t({ defaultMessage: 'Add Option' }) }
            </Button>
          </Col>
        </Row>
        <Table
          rowKey='seq'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && {
            type: 'radio',
            selectedRowKeys: selected ? [selected.seq]:[],
            onChange: (keys: React.Key[]) => {
              setSelected(dhcpOptionList?.find(i => i.seq === keys[0]))
            }
          }}
          columns={columns}
          dataSource={dhcpOptionList}
        />
      </Form>
    </Drawer>
    <DhcpOptionModal open={openModal}
      editRecord={selected}
      currrentRecords={dhcpOptionList}
      onCancel={()=>setOpenModal(false)}
      onSave={onSaveOption} />
  </>)
}
