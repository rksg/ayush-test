import styled from 'styled-components/macro'

import { SummaryCard } from '@acx-ui/components'


export const StyledSummaryCard = styled(SummaryCard)<{ warning: boolean }>`

  ${(props) =>
    props.warning && `
      background-color: var(--acx-semantics-red-10); 
      border: 1px solid var(--acx-semantics-red-70) !important;
    `}
`

export const PublicationStatus = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;

  svg {
    margin-left: 0.5rem;
    
    path:nth-child(1) {
      fill: var(--acx-semantics-red-70)
    }
    path:nth-child(3) {
      stroke: var(--acx-semantics-red-70)
    }
  }
`