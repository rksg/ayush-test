import { Form, Row } from 'antd'
import styled        from 'styled-components/macro'

export const OnuDetailWrapper = styled(Row)`
  padding: 15px 10px;
  margin-top: var(--acx-content-vertical-space);
  background-color: rgb(253, 227, 201);
`

export const StyledFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 2px;
  }
  & .ant-col.ant-form-item-control {
    width: 100%;
  }
`