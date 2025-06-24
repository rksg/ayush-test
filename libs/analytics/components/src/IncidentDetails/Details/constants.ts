import moment from 'moment'

import { Incident } from '@acx-ui/analytics/utils'

import { Attributes } from '../IncidentAttributes'

export const commonAttributes = (incident?: Incident) => [
  Attributes.IncidentCategory,
  Attributes.IncidentSubCategory,
  Attributes.Type,
  Attributes.Scope,
  Attributes.Duration,
  Attributes.EventStartTime,
  ...(incident
    ? moment(incident.startTime).isSame(incident.impactedStart)
      ? [Attributes.EventEndTime]
      : [Attributes.DataStartTime, Attributes.DataEndTime]
    : [Attributes.EventEndTime]),
  Attributes.Visibility
]