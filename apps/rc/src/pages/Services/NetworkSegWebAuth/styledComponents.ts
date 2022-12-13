import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const TextAreaWithReset = styled(Form.Item)`
  .ant-form-item-control-input-content > .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-control-input-content > .ant-btn {
    width: 130px
  }
`
