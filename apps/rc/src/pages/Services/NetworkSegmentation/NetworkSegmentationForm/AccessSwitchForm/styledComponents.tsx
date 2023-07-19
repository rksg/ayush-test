import { Form } from 'antd'
import styled   from 'styled-components/macro'

export const OverwriteFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    > span {
      padding: 0 5px;
    }

    &.ant-form-item-required:not(.ant-form-item-required-mark-optional) > .ant-checkbox-wrapper {
      order: 1;
    }
  }
`

export const DisplayFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0;
  }
`
