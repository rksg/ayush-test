import { Button } from 'antd'
import styled     from 'styled-components'

import { PasswordInput } from '@acx-ui/components'

export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
  width: 270px;
`

export const TransparentButton = styled(Button)`
  font-size: var(--acx-body-4-font-size);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: transparent;
  }
`

export const Row = styled.div`
  display: flex;
  align-items: center;
`

export const SecretInput = styled(PasswordInput)`
  width: 280px;
  margin-left: -12px;

  & .ant-input {
    font-size: var(--acx-body-4-font-size);
  }
`
