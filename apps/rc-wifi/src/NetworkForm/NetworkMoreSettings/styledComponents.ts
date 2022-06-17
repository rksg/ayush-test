import { Checkbox, Form } from 'antd'
import styled             from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  float: left;
  width: ${props => props.width};
`
export const CheckboxWrapper = styled(Checkbox)`
  margin-right: 5px;
`

export const FormItemNoLabel = styled(Form.Item)`
  margin-bottom: 5px;
`
export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
`
