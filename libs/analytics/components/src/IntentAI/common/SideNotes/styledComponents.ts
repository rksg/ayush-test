import styled from 'styled-components/macro'

export const SideNotes = styled.div<{ $pageHeaderY: number }>`
  position: relative;
  min-height: calc(
    100vh -
    ${props => props.$pageHeaderY}px -
    var(--acx-steps-form-actions-vertical-space) * 2 -
    32px -
    var(--acx-content-horizontal-space)
  );
  border: 1px solid var(--acx-neutrals-25);
  border-radius: 4px;
  padding: 20px;
`
