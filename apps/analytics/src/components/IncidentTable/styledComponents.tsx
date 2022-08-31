import styled from 'styled-components'


import {
  IncidentSeverities,
  incidentSeverities
} from '@acx-ui/analytics/utils'
import { cssStr } from '@acx-ui/components'
import { Link }   from '@acx-ui/react-router-dom'

export const withEllipsis = `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`

export const DescriptionSpan = styled.div`
  ${withEllipsis}
  ${withDottedUnderline}
`

export type SeveritySpanProps = {
  severity: IncidentSeverities
}

export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  color: ${(props) => {
    const color = incidentSeverities[props.severity].color
    return cssStr(color)
  }};
  font-weight: var(--acx-body-font-weight-bold);
`

export const UnstyledLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`