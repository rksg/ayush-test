import { Form } from 'antd'
import styled   from 'styled-components'

export const StyledFormItem = styled(Form.Item)`
  .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional) {
    flex-direction: unset !important;

    &::before {
      content: '';
    }

    > svg {
      order: unset !important;
    }

    > button {
      position: relative;
    }
  }
`

export const RequiredMark = styled.span`
  margin: 0;
  margin-left: 3px;
  & {
    color: var(--acx-accents-orange-50);
    font-size: var(--acx-body-4-font-size);
  }
`