import { Form } from 'antd'
import styled   from 'styled-components'

export const FormItemNoMargin = styled(Form.Item)`
  & .ant-form-item-control {
      margin: none;
  }
`