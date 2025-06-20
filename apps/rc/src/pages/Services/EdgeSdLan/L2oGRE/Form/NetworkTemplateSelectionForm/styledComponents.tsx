import { Form } from 'antd'
import styled   from 'styled-components'

import { WarningCircleSolid } from '@acx-ui/icons'

export const WarningCircleRed = styled(WarningCircleSolid)`
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
`

export const ValidationMessageField = styled(Form.Item)`
  text-wrap: auto;
  margin-bottom: 0px !important;
  .ant-form-item-control-input {
    display: none;
  }
`