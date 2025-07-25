import { Space, Form, InputNumber, Select } from 'antd'

import { getRekeyTimeUnitOptions } from '../utils'

interface RekeyTimeUnitFormItemProps {
  timeFieldName: string
  timeUnitFieldName: string
}
export const RekeyTimeUnitFormItem = (props: RekeyTimeUnitFormItemProps) => {
  const { timeFieldName, timeUnitFieldName } = props
  const rekeyTimeUnitOptions = getRekeyTimeUnitOptions()

  return <Space>
    <Form.Item
      data-testid={timeFieldName}
      name={timeFieldName}
      rules={[
        { required: true },
        { type: 'number', transform: Number, min: 1, max: 16384 }
      ]}
      children={
        <InputNumber style={{ width: 80 }}/>
      }
    />
    <Form.Item
      name={timeUnitFieldName}
      children={
        <Select
          style={{ width: 120, marginTop: '23px' }}
          options={rekeyTimeUnitOptions}
          children={
            rekeyTimeUnitOptions.map((item) =>
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>)
          } />
      }
    />
  </Space>
}