import { Form } from 'antd'
import styled   from 'styled-components'

export const StyledFormItem = styled(Form.Item)`
  &.ant-form-item { margin: 0px;}
`

export const StyledFormItemTimer = styled(Form.Item)`
  &.ant-form-item { 
  position: absolute;
  bottom: 0px;
  right: 0px;

  & .ant-form-item-row .ant-col.ant-form-item-control .ant-form-item-control-input + div {
    position: absolute;
    top: 30px;
    width: 200px;
  }
`

export const tooltipIconStyle = { width: 16, height: 16, marginTop: '3px' }