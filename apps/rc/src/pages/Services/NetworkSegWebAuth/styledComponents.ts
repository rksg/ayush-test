import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const FormItemWithReset = styled(Form.Item)`
  .ant-input-group > .ant-input {
    border-radius: 4px;
  }

  .ant-input-group-addon {
    border: 0;
    background-color: transparent;
  }
`
