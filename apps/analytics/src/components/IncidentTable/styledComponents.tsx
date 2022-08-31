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
  cursor: pointer;
  ${withEllipsis}
  ${withDottedUnderline}
`

export const ActionRow = styled.div`
  display: flex;
  flex-direction: row;
`

export const ActionId = styled.div`
  margin-right: 10px;
  max-width: 12px;
  margin-left: 10px;
`
export const IncidentDrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`
export const IncidentCause = styled.div`
  font-weight: var(--acx-subtitle-1-font-weight);
  margin-top: 20px;
`
export const IncidentImpactedClient = styled.div`
  font-weight: var(--acx-subtitle-1-font-weight);
`
export const IncidentRootCauses = styled.div`
 text-decoration: underline;
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

export const DateSpan = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
`

export const UnstyledLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`
