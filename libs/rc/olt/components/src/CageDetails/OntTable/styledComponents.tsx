import styled from 'styled-components/macro'

import { Table } from '@acx-ui/components'

export const StyledTable = styled(Table)<Record<string, unknown>>`
  th {
    &:hover {
      background: transparent !important;
      border: !important;
    }
    &:before {
      display: none;
    }
  }
  tr.selected-row {
    background-color: var(--acx-accents-orange-20);
    td {
      background-color: var(--acx-accents-orange-20);
    }
    &:hover {
      background-color: var(--acx-accents-orange-20);
      td {
        background-color: var(--acx-accents-orange-20);
      }
    }
  }
  .ant-table-cell-fix-right {
    display: none;
  }
`

export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

export const GreenPercentageBar = styled.div`
  margin: auto; 
  width: 50px;
  & .ant-progress-bg {
    background-color: var(--acx-semantics-green-50) !important;
  }
`