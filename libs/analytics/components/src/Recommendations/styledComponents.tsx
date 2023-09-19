import { Badge as AntBadge } from 'antd'
import styled                from 'styled-components'

import { Table, TableProps } from '@acx-ui/components'

import { RecommendationListItem } from './services'

export const colors = [
  '--acx-semantics-yellow-30',
  '--acx-semantics-yellow-60',
  '--acx-semantics-red-60'
]

export const optimizedColors = [
  '--acx-semantics-green-60',
  '--acx-semantics-red-60'
]

export const Status = styled.span<{ $statusEnum?: string }>`
  ${props => props.$statusEnum === 'applywarning' && 'color: var(--acx-semantics-red-50);'}
`

interface IconProps {
  value: number
  text?: string
}
export const PriorityIcon = styled(AntBadge).attrs((props: IconProps) => ({
  color: `var(${colors[props.value]})`,
  text: props.text
}))<IconProps>``

export const OptimizedIcon = styled(AntBadge)
  .attrs((props: IconProps) => ({ color: `var(${optimizedColors[props.value]})` }))<IconProps>``

export const RecommendationTableWrapper =
styled((props: TableProps<RecommendationListItem>) => <Table {...props} />)`
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

  .ant-table-body {
    overflow: unset !important;
  }

  .ant-table-cell-ellipsis.actions-column {
    overflow: unset !important;
  }
`
