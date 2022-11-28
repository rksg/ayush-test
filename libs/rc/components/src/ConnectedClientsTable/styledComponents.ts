import styled     from 'styled-components/macro'

import {
  HealthSolid,
  HealthOutline
} from '@acx-ui/icons'

type Type = keyof typeof healthColors

const healthColors = {
  good: '--acx-semantics-green-50',
  average: '--acx-semantics-yellow-40',
  poor: '--acx-semantics-red-50',
  default: '--acx-neutrals-30'
}

export const HealthIcon = styled(HealthSolid)<{ $type: string }>`
  path:first-child {
    stroke: var(${props => healthColors[props.$type as Type]});
    fill: var(${props => healthColors[props.$type as Type]});
  }
`
