import styled from 'styled-components/macro'

import {
  IncidentSeverities,
  incidentSeverities
} from '@acx-ui/analytics/utils'
import { cssStr } from '@acx-ui/components'
export type SeveritySpanProps = {
  severity: string
}

export const NonSelectableItem = styled.div.attrs(
  { onClick: e => e.stopPropagation() }
)`
  width: 100%;
`
export const Container = styled.div`
  min-width: 150px;
  max-width: 180px;
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

`
export const Label = styled.div`
  width : 100px;
  max-width: 120px;
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
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: -2px;
`