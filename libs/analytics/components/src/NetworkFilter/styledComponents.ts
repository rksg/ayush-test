import styled, { css } from 'styled-components/macro'

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
export const Container = styled.div.attrs((props: {$open?: boolean}) => props)`
  min-width: 165px;
  max-width: 322px;
  ${(props) => props.$open ? css`width: 322px;` : css`width: 165px;`}
`
export const SeverityContainer = styled.div`
  display: flex;
  flex-direction: row;
  line-height: 8px;
  justify-content: right

`
export const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  column-gap: 15px;
  align-items: center;
  justify-content: space-between;
`
export const Label = styled.div`
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-content: left
`
export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  background-color: ${(props) => {
    const color =
      incidentSeverities[props.severity as IncidentSeverities]?.color ?? ''
    return cssStr(color)
  }};
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: -4px;
  border: 1px solid var(--acx-primary-white);
  z-index: ${(props) => severityZIndexMap[props.severity]}
`
