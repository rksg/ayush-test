import { useEffect } from 'react'

import { storiesOf }           from '@storybook/react'
import { Button, Form, Input } from 'antd'
import { v4 as uuidv4 }        from 'uuid'

import { DraggableTagField } from './DraggableTagField'
import { DraggableTag }      from './DraggableTagSelector'

export type DraggableTagSelectorProps = {
  value?: DraggableTag[]
  onChange?: (val: DraggableTag[]) => void
  options: string[]
  maxCustomTags?: number
}

storiesOf('Draggable Tags', module)
  .add('Basic', () => {
    const [form] = Form.useForm()
    const options = ['Option1', 'Option2', 'Option3', 'Option4']

    useEffect(() => {
      form?.setFieldsValue({
        name: 'test',
        tags: [
          { id: uuidv4(), value: 'Option1', valid: true },
          { id: uuidv4(), value: 'Option2', valid: true },
          { id: uuidv4(), value: 'Custom', valid: true, isCustom: true }
        ]
      })
    }, [])

    return <Form
      form={form}
      onFinish={async (values: { name?: string, tags: DraggableTag[] }) => {
        console.log(values) // eslint-disable-line no-console
      }}
      labelCol={{ span: 2 }}
      wrapperCol={{ span: 10 }}
    >
      <Form.Item name='name' label='Name'>
        <Input />
      </Form.Item>

      <Form.Item label='Tags'>
        <DraggableTagField
          name='tags'
          options={options}
          maxTags={8}
          rules={[ // optional
            { required: true, message: 'Please select at least one tag' }
          ]}
        />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 2, span: 10 }}>
        <Button type='primary' htmlType='submit'>
            Submit
        </Button>
      </Form.Item>

    </Form>
  })
