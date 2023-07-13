import styled from 'styled-components'

export const ActionWrapper = styled.span<{ $disabled?: boolean }>`
  ${props => props.$disabled
    ? `
      cursor: not-allowed;
      pointer-events: none;
      color: var(--acx-neutrals-50);
    `
    : `
    cursor: pointer;
    color: var(--acx-primary-black);
    `}
`