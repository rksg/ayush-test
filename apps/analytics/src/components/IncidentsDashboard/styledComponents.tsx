import { Typography } from 'antd'
import styled         from 'styled-components'

import { incidentSeverities }         from '@acx-ui/analytics/utils'
import { IncidentSeverities, cssStr } from '@acx-ui/components'

type SeveritySpanProps = {
  severity: IncidentSeverities
}

export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  background-color: ${(props) => {
    const color = incidentSeverities[props.severity]?.color
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

export const ClientImpactParagraph = styled(Typography.Paragraph)`
  font-family: var(--acx-neutral-brand-font);
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 13px;
  color: var(--acx-neutrals-70)
`
