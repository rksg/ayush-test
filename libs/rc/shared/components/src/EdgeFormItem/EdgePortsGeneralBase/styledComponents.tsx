import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form }                   from 'antd'
import styled                     from 'styled-components/macro'


export const IpAndMac = styled.div`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 1fr;
  align-items: baseline;
  margin: 5px 0px 15px 0px;
`

export const StyledQuestionIcon = styled(QuestionCircleOutlined)`
margin-left: 5px;
`

export const StyledHiddenFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
 .ant-form-item-control-input {
  display: none;
 }
`