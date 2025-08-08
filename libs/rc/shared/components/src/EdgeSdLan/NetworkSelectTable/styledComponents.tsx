import { Form } from 'antd'
import styled   from 'styled-components'

export const ValidationMessageField = styled(Form.Item)`
  text-wrap: auto;
  margin-bottom: 0px !important;
  .ant-form-item-control-input {
    display: none;
  }
`