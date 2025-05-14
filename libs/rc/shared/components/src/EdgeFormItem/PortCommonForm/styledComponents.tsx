import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form }                   from 'antd'
import styled                     from 'styled-components/macro'

export const StyledQuestionIcon = styled(QuestionCircleOutlined)`
  margin-left: 5px;
`

export const StyledNoMarginFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
`