import { useEffect, useState } from 'react'

import { Col, Divider, Form, Input, Row, Space } from 'antd'
import { useIntl }                               from 'react-intl'

import { Button, Drawer, Subtitle, Table, TableProps }     from '@acx-ui/components'
import { getDhcpOptionList, SwitchDhcp, SwitchDhcpOption } from '@acx-ui/rc/utils'

import { DhcpOptionModal } from './DhcpOptionModal'

const DHCP_OPTIONS = getDhcpOptionList()

export function AddPoolDrawer (props: {
  visible: boolean,
  editPool?: SwitchDhcp,
  onSavePool?: (values: SwitchDhcp)=>void,
  onClose?: ()=>void
}) {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<SwitchDhcpOption>()
  const [dhcpOptionList, setDhcpOptionList] = useState<SwitchDhcpOption[]>()

  useEffect(()=>{
    form.resetFields()
  }, [form, props.visible])

  const onSave = (values: SwitchDhcpOption) => {
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
      render: (data, row) => DHCP_OPTIONS[row.seq as keyof typeof DHCP_OPTIONS].label
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

  return (<>
    <Drawer
      title={props.editPool?
        $t({ defaultMessage: 'Edit DHCP Pool' }):
        $t({ defaultMessage: 'Add DHCP Pool' })}
      closable={true}
      maskClosable={false}
      width={460}
      footer={<div>
        <Button
          // loading={isLoading}
          onClick={() => form.submit()}
          type={'secondary'} >
          {$t({ defaultMessage: 'Add' })}
        </Button>
        <Button onClick={props?.onClose}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </div>}
    >
      <Form layout='vertical' form={form} onFinish={props.onSavePool}>
        <Form.Item
          name='poolName'
          label={$t({ defaultMessage: 'Pool Name' })}
          rules={[{ required: true }]}
          children={<Input />}
        />
        <Form.Item
          name='subnetAddress'
          label={$t({ defaultMessage: 'Subnet Address' })}
          rules={[{ required: true }]}
          children={<Input />}
        />
        <Form.Item
          name='subnetMask'
          label={$t({ defaultMessage: 'Subnet Mask' })}
          rules={[{ required: true }]}
          children={<Input />}
        />
        <Form.Item label={$t({ defaultMessage: 'Excluded Range' })}>
          <Space align='start'>
            <Form.Item
              name='excludedStart'
              rules={[{ required: true }]}
              children={<Input />}
            />
            -
            <Form.Item
              name='excludedEnd'
              rules={[{ required: true }]}
              children={<Input />}
            />
          </Space>
        </Form.Item>
        <Form.Item label={$t({ defaultMessage: 'Lease Time' })}>
          <Space align='start'>
            <Form.Item
              name='leaseDays'
              rules={[{ required: true }]}
              children={<Input />}
            />
            {$t({ defaultMessage: 'Day' })}
            <Form.Item
              name='leaseHrs'
              rules={[{ required: true }]}
              children={<Input />}
            />
            {$t({ defaultMessage: 'Hours' })}
            <Form.Item
              name='leaseMins'
              rules={[{ required: true }]}
              children={<Input />}
            />
            {$t({ defaultMessage: 'Minutes' })}
          </Space>
        </Form.Item>
        <Form.Item
          name='defaultRouterIp'
          label={$t({ defaultMessage: 'Default Router IP' })}
          rules={[{ required: true }]}
          children={<Input />}
        />
        <Divider />
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
        <Table type='form'
          rowKey='seq'
          rowActions={rowActions}
          rowSelection={{ type: 'radio', selectedRowKeys: selected ? [selected.seq]:[] }}
          columns={columns}
          dataSource={dhcpOptionList}
        />
      </Form>
    </Drawer>
    <DhcpOptionModal open={openModal}
      editRecord={selected}
      currrentRecords={dhcpOptionList}
      onCancel={()=>setOpenModal(false)}
      onSave={onSave} />
  </>)
}