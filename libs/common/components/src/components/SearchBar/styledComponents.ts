import { Input as AntInput } from 'antd'
import styled                from 'styled-components/macro'

export const Input = styled(AntInput)`
  height: 28px;
  border: 1px solid var(--acx-neutrals-40);
  border-radius: 4px;
  .ant-input::placeholder {
    color: var(--acx-neutrals-50);
    font-style: italic;
  }
`
