import styled, { css } from 'styled-components/macro'

import { SNRSolid } from '@acx-ui/icons'

export const SNRSolidIcon = styled(SNRSolid)<{ $status: string | null }>`
  path {
    stroke: var(--acx-neutrals-30)
  }

  ${props => props.$status === 'excellent' ? css`
    path { stroke: var(--acx-primary-black) }
  ` : ''}

  ${props => props.$status === 'good' ? css`
    path { stroke: var(--acx-primary-black) }
    path:nth-child(3) { stroke: var(--acx-neutrals-30) }
  ` : ''}

  ${props => props.$status === 'low' ? css`
    path:first-child,
    path:last-child {
      stroke: var(--acx-primary-black)
    }
  ` : ''}

  ${props => props.$status === 'poor' ? css`
    path:last-child {
      stroke: var(--acx-primary-black)
    }
  ` : ''}
`

export const WifiSignal = styled.div`
  display: flex;
  align-content: center;
  span {
    display: inherit;
  }  
  svg {
    margin-left: 4px;
  }
`