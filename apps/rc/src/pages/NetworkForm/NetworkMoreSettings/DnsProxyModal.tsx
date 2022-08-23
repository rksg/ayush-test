import { useState } from 'react'

import {
  Form
} from 'antd'


import {
  Button,
  Table,
  TableProps,
  Modal,
  showToast
} from '@acx-ui/components'

const basicColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }
]

const basicData = [
  {
    key: '1',
    name: 'John Doe',
    age: 32,
    address: 'sample address'
  },
  {
    key: '2',
    name: 'Jane Doe',
    age: 33,
    address: 'new address'
  },
  {
    key: '3',
    name: 'Will Smith',
    age: 45,
    address: 'address'
  }
]

const actions: TableProps<(typeof basicData)[0]>['actions'] = [
  {
    label: 'Edit',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows.length} item(s)`
    })
  },
  {
    label: 'Delete',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Edit ${selectedRows.length} item(s)`
    })
  }
]

export function MultiSelectTable () {
  return (<>
    <Button type='link' style={{ float: 'right' }} >Add</Button>
    <Table
      columns={basicColumns}
      dataSource={basicData}
      actions={actions}
      rowSelection={{ defaultSelectedRowKeys: [] }}
    />
  </>
  )
}


export function DnsProxyModal () {
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    onFinish={() => setVisible(false)}
  >
    <Form.Item
      label='Name'
      name='Name'
      rules={[{ required: true, message: 'Please input your Name!' }]}
    >
      <MultiSelectTable></MultiSelectTable>
    </Form.Item>
  </Form>

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    form.submit()
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <>
      <Button type='link'
        style={{ textAlign: 'left',
          display: 'inline',
          marginLeft: '15px' }}
        onClick={showModal}
        disabled={true}>
        Manage</Button>
      <Modal
        title='DNS Proxy'
        visible={visible}
        okText='Add'
        onCancel={handleCancel}
        onOk={handleOk}
      >
        {formContent}
      </Modal>
    </>
  )
}
