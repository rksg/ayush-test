import { Form, Radio } from 'antd'
import styled          from 'styled-components'

export const RadioDescription = styled(Form.Item)`
margin-bottom: 0px !important;
`

export const RadioGroup = styled(Radio.Group)`
  .ant-radio-wrapper {
    width: 100%
  }
  label>span:nth-child(2) {
    width: 100%
  }
`