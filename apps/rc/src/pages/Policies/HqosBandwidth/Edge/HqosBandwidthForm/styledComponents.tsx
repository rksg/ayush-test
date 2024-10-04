import { Col, Form } from 'antd'
import styled        from 'styled-components/macro'

export const FieldText = styled.div`
  font-size: var(--acx-body-4-font-size);
`
export const Content = styled.div`
  .mb-16 {
    margin-bottom: 16px;
  }
  .warning-text {
    color: var(--acx-neutrals-60);
  }
`
export const FlexEndCol = styled(Col)`
  display: flex;
  justify-content: end;
`

export const StyledFormItem = styled(Form.Item)`
  .ant-form-item-control-input {
    min-height: 0;
  }
`