import styled from 'styled-components/macro'

import {
  IncidentSeverities,
  incidentSeverities
} from '@acx-ui/analytics/utils'
import { cssStr } from '@acx-ui/components'
export type SeveritySpanProps = {
  severity: string
}

const severityZIndexMap : { [key : string] : number } = {
  P1: 1000,
  P2: 900,
  P3: 800,
  P4: 700
}
export const NonSelectableItem = styled.div.attrs(
  { onClick: e => e.stopPropagation() }
)`
  width: 100%;
`
export const Container = styled.div.attrs((props: { $open?: boolean }) => props)`
  min-width: 169px;
  max-width: 322px;
  ${(props) => props.$open ? 'width: 322px;' : 'width: 169px;'}
  .ant-select-selector >
  .ant-select-selection-overflow >
  .ant-select-selection-overflow-item.ant-select-selection-overflow-item-suffix {
    top: revert !important;
  }
`
export const SeverityContainer = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 8px;
  justify-content: right;
`
export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  &:first-child { margin-left: 15px; }
  margin-left: -4px;
  background-color: ${(props) => {
    const color =
      incidentSeverities[props.severity as IncidentSeverities]?.color ?? ''
    return cssStr(color)
  }};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--acx-primary-white);
  z-index: ${(props) => severityZIndexMap[props.severity]}
`
