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
export const FieldLabelUtilMsp = styled.div`
  display: grid;
  grid-template-columns: 140px 300px 100px;
  align-items: baseline;
`
export const FieldLabelUtil = styled.div`
  display: grid;
  grid-template-columns: 180px 260px 100px;
  align-items: baseline;
`
export const StackedBarContainer = styled.div`
  border-radius: 20px;
  overflow: hidden;
  display: inline-block;
`
