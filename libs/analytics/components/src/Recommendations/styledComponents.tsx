import { Badge as AntBadge } from 'antd'
import styled                from 'styled-components'

import { Table, TableProps } from '@acx-ui/components'

import { mutedStyles } from '../IncidentTable/styledComponents'

import { RecommendationListItem } from './services'

export const colors = [
  '--acx-semantics-yellow-30',
  '--acx-semantics-yellow-60',
  '--acx-semantics-red-60'
]

export const optimizedColors = [
  '--acx-semantics-green-60',
  '--acx-semantics-red-60',
  '--acx-neutrals-50'
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
  ${mutedStyles}
  .ant-picker-suffix {
    margin: 0 !important;
  }
`

export const OptimizationHeader = styled.div`
  display: flex;
`

export const OptimizationTooltip = styled.div`
  padding-left: 8px;
`
