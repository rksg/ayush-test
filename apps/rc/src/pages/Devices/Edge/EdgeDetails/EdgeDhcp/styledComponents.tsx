import styled from 'styled-components/macro'

import { ConfigurationSolid } from '@acx-ui/icons'

export const SettingIcon = styled(ConfigurationSolid)<{ disabled: boolean }>`
  color: ${props => !props.disabled ? 'var(--acx-accents-blue-50)' : 'var(--acx-neutrals-50)'};
  vertical-align: middle;
  &:hover{
    ${props => !props.disabled && 'cursor: pointer;'}
    
  }
`