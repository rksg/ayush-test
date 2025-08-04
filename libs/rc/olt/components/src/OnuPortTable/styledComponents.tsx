import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const StyledFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
  & .ant-col.ant-form-item-control {
    margin-top: 0px;
  }
`