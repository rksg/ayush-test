import styled from 'styled-components'

import { incidentSeverities }         from '@acx-ui/analytics/utils'
import { IncidentSeverities, cssStr } from '@acx-ui/components'

type SeveritySpanProps = {
  severity: IncidentSeverities
}

export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  background-color: ${(props) => {
    const color =
      incidentSeverities[props.severity]?.color ?? ''
    return cssStr(color)
  }};
  width: 11px;
  height: 11px; 
  border-radius: 50%;
  border-width: 5px;
  border-color: var(--acx-primary-white);
  margin-top: 10px;
`

export const SeverityContainer = styled.div`
  display: flex;
  padding-right: 10px;
`
