import { useState } from 'react'

import { Modal }  from '..'
import { Button } from '../../Button'

import {
  Form,
  InputNumber,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
} from 'antd';

const { Option } = Select;

export function FormModal () {
  const [visible, setVisible] = useState(false)
  
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>

  const formContent = <>
    <Form
      name="validate_other"
      initialValues={{
        'input-number': 3,
        rate: 3.5,
      }}
    >
      <Form.Item
        name="select-multiple"
        label="Select[multiple]"
        rules={[{ required: true, message: 'Please select your favourite colors!', type: 'array' }]}
      >
        <Select mode="multiple" placeholder="Please select favourite colors">
          <Option value="red">Red</Option>
          <Option value="green">Green</Option>
          <Option value="blue">Blue</Option>
        </Select>
      </Form.Item>

      <Form.Item label="InputNumber">
        <Form.Item name="input-number" noStyle>
          <InputNumber min={1} max={10} />
        </Form.Item>
        <span className="ant-form-text"> machines</span>
      </Form.Item>

      <Form.Item name="switch" label="Switch" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="slider" label="Slider">
        <Slider
          marks={{
            0: 'A',
            20: 'B',
            40: 'C',
            60: 'D',
            80: 'E',
            100: 'F',
          }}
        />
      </Form.Item>

      <Form.Item name="radio-group" label="Radio.Group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="radio-button"
        label="Radio.Button"
        rules={[{ required: true, message: 'Please pick an item!' }]}
      >
        <Radio.Group>
          <Radio.Button value="a">item 1</Radio.Button>
          <Radio.Button value="b">item 2</Radio.Button>
          <Radio.Button value="c">item 3</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="rate" label="Rate">
        <Rate />
      </Form.Item>
    </Form>
  </>

  const showModal = () => {
    setVisible(true)
  }

  const handleOk = () => {
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  // const footer = [
  //   <Button key='cancel'size='large' onClick={handleCancel}>
  //     Cancel
  //   </Button>,
  //   <Button key='add' size='large' type='primary' onClick={handleOk}>
  //     Add
  //   </Button>
  // ]

  return (
    <>
      <Button onClick={showModal}>
        Form Modal
      </Button>
      <Modal
        title='Form Modal'
        visible={visible}
        // footer={footer}
        okText='Add'
        onCancel={handleCancel}
        onOk={handleOk}
        width={800}
        subTitle='some description'
      >
        {formContent}
      </Modal>
    </>
  )  
}
