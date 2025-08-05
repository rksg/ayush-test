import { Space, Form, InputNumber, Select } from 'antd'

import { getRekeyTimeUnitOptions } from '../utils'

interface RekeyTimeUnitFormItemProps {
  title: string
  timeFieldName: string
  timeUnitFieldName: string
}
export const RekeyTimeUnitFormItem = (props: RekeyTimeUnitFormItemProps) => {
  const { title, timeFieldName, timeUnitFieldName } = props
  const rekeyTimeUnitOptions = getRekeyTimeUnitOptions()

  return <Space align='start'>
    <Form.Item
      data-testid={timeFieldName}
      name={timeFieldName}
      label={title}
      validateFirst
      rules={[
        { required: true },
        { type: 'number', transform: Number, min: 1, max: 16384 }
      ]}
    >
      <InputNumber style={{ width: 80 }}/>
    </Form.Item>
    <Form.Item
      name={timeUnitFieldName}
    >
      <Select
        style={{ width: 120, marginTop: '23px' }}
        options={rekeyTimeUnitOptions}
      />
    </Form.Item>
  </Space>
}