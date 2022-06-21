import { Button as AntButton } from 'antd'
import styled, { css }         from 'styled-components/macro'

export const Button = styled(AntButton)<{ $customType: string | null }>`
  ${props => props.$customType === 'secondary' ? css`
    background-color: var(--acx-accents-orange-50);
    border-color: var(--acx-accents-orange-50);
    &:hover, &:focus {
      background-color: var(--acx-accents-orange-55);
      border-color: var(--acx-accents-orange-55);
    }
  ` : ''}

  vertical-align: bottom;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  svg {
    &:before {
      content: 'a';
    }
    width: 16px;
    height: 16px;
    path {
      stroke: var(--acx-primary-black);
    }
  }
`
