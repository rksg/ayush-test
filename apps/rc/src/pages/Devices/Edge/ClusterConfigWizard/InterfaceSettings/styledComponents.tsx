import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const StyledHiddenFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
 .ant-form-item-control-input {
    display: none;
  }
`