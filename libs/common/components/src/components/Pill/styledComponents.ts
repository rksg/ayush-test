import styled from 'styled-components/macro'

import { incidentSeverities } from '@acx-ui/analytics/utils'

import { TrendType, IncidentSeverities } from '.'

const pillColor = ({ type }: { type: TrendType | IncidentSeverities }) => {
  switch (type) {
    case 'positive': return '--acx-semantics-green-50'
    case 'negative': return '--acx-semantics-red-50'
    case 'none': return '--acx-neutrals-50'
    default: return incidentSeverities[type].color
  }
}
export const Pill = styled.span`
  display: inline-block;
  border-radius: 10px;
  padding: 3px 8px;
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-6-line-libs/analytics/utils/src/timeseries.tsheight);
  color: var(--acx-primary-white);
  background-color: var(${pillColor});
`
