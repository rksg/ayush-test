import { Form } from 'antd'
import styled   from 'styled-components/macro'

import { CompatibilityWarningTriangleIcon } from '@acx-ui/rc/components'

export const StyledHiddenFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
 .ant-form-item-control-input {
    display: none;
  }
`

export const StyledCompatibilityWarningTriangleIcon = styled(CompatibilityWarningTriangleIcon)`
  position: absolute;
  top: 0px;
  display: inline;
`