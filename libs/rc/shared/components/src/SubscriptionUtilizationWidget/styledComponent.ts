import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const OverutilizationText = styled(Typography.Text)`
  color: var(--acx-semantics-red-50)
`
export const LegendDot = styled.span`
  height: 6px;
  width: 6px;
  margin: 2px;
  display: inline-block;
  background: var(--acx-accents-blue-50);
  border-radius: 50%;
`
