import { Form as AntForm, Space } from 'antd'
import styled                     from 'styled-components/macro'

export const Form = styled(AntForm)`
  .ant-form-item {
    font-size: 12px
  }
`

export const OsType = styled(Space)`
  svg {
    width: 16px;
    vertical-align: middle;
    path: {
      fill: var(--acx-neutrals-70)
    }
  }
`