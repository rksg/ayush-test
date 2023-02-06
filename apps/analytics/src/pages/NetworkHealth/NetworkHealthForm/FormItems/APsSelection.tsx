import { Form, Input } from 'antd'

const APSelectionInput = Input.TextArea

export function APsSelection () {
  return <Form.Item
    name={['networkPaths', 'networkNodes']}
    rules={[
      { required: true }
    ]}
    children={<APSelectionInput />}
  />
}
