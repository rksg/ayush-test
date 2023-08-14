import styled from 'styled-components'

import { Table, TableProps } from '@acx-ui/components'

import { RecommendationRow } from './table'

const colors = [
  '--acx-semantics-yellow-30',
  '--acx-semantics-yellow-60',
  '--acx-semantics-red-60'
]

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`
export const UnderlinedSpan = styled.span<{ $statusEnum?: string }>`
  ${withDottedUnderline}
  ${props => props.$statusEnum === 'applywarning' && 'color: var(--acx-semantics-red-50);'}
`

export const Priority = styled.div`
  display: flex;
  align-items: center
`
export const PriorityIcon = styled.span.attrs((props: { value: number }) => props)`
  display: flex;
  margin-right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(${props => colors[props.value]});
`

export const RecommendationTableWrapper =
styled((props: TableProps<RecommendationRow>) => <Table {...props} />)`
  --recommendation-table-muted-row-font-color: var(--acx-neutrals-40);
  --recommendation-table-muted-row-background-color: var(--acx-neutrals-20);

  .table-row-muted {
    color: var(--recommendation-table-muted-row-font-color);
    background-color: var(--recommendation-table-muted-row-background-color);
  }

  && tbody > tr.table-row-muted:hover > td {
    background: var(--recommendation-table-muted-row-background-color);
  }

  .ant-table-row-selected.table-row-muted {
    background-color: var(--recommendation-table-muted-row-background-color);
  }

  .table-row-muted .ant-table-cell {
    background-color: var(--recommendation-table-muted-row-background-color);
  }

  .ant-table-row.table-row-muted:hover {
    background-color: var(--recommendation-table-muted-row-background-color);
  }

  .table-row-muted .ant-table-cell-row-hover {
    background-color: var(--recommendation-table-muted-row-background-color);
  }

  .ant-radio-inner {
    background-color: var(--acx-primary-white);
  }

  .ant-table-content, .ant-table-cell-ellipsis.actions-column {
    overflow: unset !important;
  }
`