import { Form as AntForm, Space } from 'antd'
import styled                     from 'styled-components/macro'

export const Form = styled(AntForm)`
  .ant-form-item {
    font-size: var(--acx-body-4-font-size);
  }

  .ant-form-item-label > label {
    color: var(--acx-neutrals-70)
  }
`

export const OsType = styled(Space)`
  svg {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    path {
      fill: var(--acx-neutrals-70)
    }
  }
`