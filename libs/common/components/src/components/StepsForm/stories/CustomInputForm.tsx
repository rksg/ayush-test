import React, { useEffect, useRef, useState } from 'react'

import { Row, Col, Form, Input, Typography } from 'antd'
import _                                     from 'lodash'

import { StepsForm }         from '..'
import { Button }            from '../../Button'
import { Modal }             from '../../Modal'
import { Table, TableProps } from '../../Table'
import { showToast }         from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

const defaultData = [
  { id: 1, name: 'Name 1' },
  { id: 2, name: 'Name 2' },
  { id: 3, name: 'Name 3' },
  { id: 4, name: 'Name 4' }
]

type DataType = typeof defaultData[number]
const key = 'id'

const columns: TableProps<DataType>['columns'] = [{
  key: 'name',
  dataIndex: 'name',
  title: 'Name'
}]

function DataTable (props: Partial<TableProps<DataType>>) {
  return <Table {...props}
    rowKey={key}
    columns={columns}
  />
}

function DataTableInput (props: {
  value?: DataType[]
  onChange?: (items: DataType[]) => void
}) {
  return <DataTable
    dataSource={defaultData}
    rowSelection={{
      selectedRowKeys: props.value?.map(item => item.id),
      onChange: (_, items) => {
        props.onChange?.(items)
      }
    }}
  />
}

function DataTableWithModalInput (props: {
  value?: DataType[],
  onChange?: (items: DataType[]) => void
}) {
  const [show, setShow] = useState(false)
  const controlled = useRef(props.value !== undefined).current
  const [value, setValue] = useState<Record<string, DataType>>(_.keyBy(props.value ?? {}, key))
  const items = Object.values(value).filter(Boolean)
  const [form] = Form.useForm<DataType>()

  useEffect(() => {
    if (!controlled) return
    // prevent switching from controlled > uncontrolled
    if (props.value === undefined) return
    setValue(_.keyBy(props.value, key))
  }, [controlled, props.value])

  const handleOpen = (item?: DataType) => {
    setShow(true)
    if (item) form.setFieldsValue(item)
  }
  const handleClose = () => setShow(false)
  const handleSave = (data: DataType) => {
    if (!data.id) data.id = Date.now()
    const newValue = { ...value, [data.id]: data }
    setValue(newValue)
    handleClose()
    props.onChange?.(Object.values(newValue))
  }

  const rowActions: TableProps<DataType>['rowActions'] = [{
    label: 'Edit',
    onClick: ([item]) => handleOpen(item)
  }, {
    label: 'Delete',
    onClick: ([item], clear) => {
      clear()
      const newValue = _(value)
        .toPairs()
        .filter(([id]) => id !== String(item.id))
        .fromPairs()
        .value()
      setValue(newValue)
      props.onChange?.(Object.values(newValue))
    }
  }]
  const actions: TableProps<DataType>['actions'] = [{
    label: 'Add',
    onClick: handleOpen
  }]

  return <>
    <DataTable
      dataSource={items}
      rowSelection={{ type: 'radio' }}
      rowActions={rowActions}
      actions={actions}
    />
    <Modal destroyOnClose
      visible={show}
      title='Add Item'
      width={200}
      footer={[
        <Button key='submit' type='secondary' onClick={() => form.submit()}>Save</Button>,
        <Button key='cancel' type='link' onClick={handleClose}>Cancel</Button>
      ]}
    >
      <Form<DataType> form={form} onFinish={handleSave} layout='vertical'>
        <Form.Item name='id' hidden />
        <Form.Item name='name'
          label='Name'
          rules={[{ required: true }]}
          children={<Input />}
        />
      </Form>
    </Modal>
  </>
}

export function CustomInputForm () {
  return (
    <StepsForm
      onCancel={() => showToast({ type: 'info', content: 'Cancel' })}
      onFinish={async () => {
        await wait(1000) // mimic external service call
        showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
      }}
    >
      <StepsForm.StepForm
        title='Step 1'
        initialValues={{ field1: [], field2: defaultData.slice(0, 1) }}
        // eslint-disable-next-line no-console
        onFinish={async (data) => console.log(data)}
      >
        <Typography.Text>Check Chrome Inspector Console to see the value on submit</Typography.Text>
        <Row gutter={20}>
          <Col span={10}>
            <StepsForm.Title children='Step 1' />
            <Form.Item name='field1' label='Table as Custom Input'>
              <DataTableInput />
            </Form.Item>
            <Form.Item name='field2' label='Table with Modal as Custom Input'>
              <DataTableWithModalInput />
            </Form.Item>
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}
