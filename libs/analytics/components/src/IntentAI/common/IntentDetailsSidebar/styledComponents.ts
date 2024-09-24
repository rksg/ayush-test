import styled from 'styled-components/macro'

export const IntentDetailsSidebar = styled.div<{ $pageHeaderY: number }>`
  overflow-y: auto;
  height: calc(
    100vh -
    ${props => props.$pageHeaderY}px -
    var(--acx-content-horizontal-space)
  );
`
