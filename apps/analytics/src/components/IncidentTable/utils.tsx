import { useState } from 'react'

import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { 
  calculateSeverity,
  Incident,
  incidentInformation,
  noDataSymbol,
  getRootCauseAndRecommendations,
  useIncidentScope,
  useShortDescription
} from '@acx-ui/analytics/utils'
import {  Drawer }                   from '@acx-ui/components'
import { formatter, durationFormat } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const getIncidentBySeverity = (value?: number | null) => {
  if (value === null || value === undefined) {
    return noDataSymbol
  }

  const severity = calculateSeverity(value)
  if (!severity) return noDataSymbol

  return severity
}

export const formatDate = (datetimestamp?: string) => {
  if (typeof datetimestamp !== 'string') return noDataSymbol
  return formatter('dateTimeFormat')(datetimestamp as string)
}

export const formatDuration = (startTimestamp?: string, endTimestamp?: string) => {
  if (typeof startTimestamp !== 'string') return noDataSymbol
  if (typeof endTimestamp !== 'string') return noDataSymbol

  const start = moment(startTimestamp)
  const end = moment(endTimestamp)

  const diffInMillis = end.diff(start, 'millisecond')
  return durationFormat(diffInMillis)
}

export const clientImpactSort = (a?: unknown, b?: unknown) => {
  let c = (a === noDataSymbol) ? -1 : parseFloat(a as string)
  let d = (b === noDataSymbol) ? -1 : parseFloat(b as string)
  if (isNaN(c)) c = -2
  if (isNaN(d)) d = -2
  if (c > d) return -1
  if (c < d) return 1
  return 0
}

export const severitySort = (a?: unknown, b?: unknown) => {
  if (typeof a !== 'number' && typeof b !== 'number') return 0
  const isDefined = typeof a !== 'undefined' && typeof b !== 'undefined'
  const c = a as number
  const d = b as number
  if (isDefined && c > d) return -1
  if (isDefined && c < d) return 1
  return 0
}

export interface FormatIntlStringProps {
  message: {
    defaultMessage: string
  }
  scope?: string
  threshold?: string
}

export const FormatIntlString = (props: FormatIntlStringProps) => {
  const { $t } = useIntl()
  const { message, scope, threshold } = props
  const intlMessage = $t(message, { scope, threshold, noDataSymbol })
  return <span>{intlMessage}</span>
}

export interface LongIncidentDescriptionProps {
  incident: Incident
}
const renderNumberedListFromArray = ( list : string[] ) => {
  if (!Array.isArray(list)) return ''
  return list.map((body, index) => (
    (body !== '') &&
    <UI.ActionRow key={index}>
      { (index > 0) && <UI.ActionId>{index}. </UI.ActionId> }
      <div>
        { body.split('\\n').map(
          (text : string) => <> {text}<br /></>
        )}
      </div>
    </UI.ActionRow>)
  )
}

export const LongIncidentDescription = (props: LongIncidentDescriptionProps) => {
  const { incident } = props
  const { rootCauses } = getRootCauseAndRecommendations(incident.code, incident.metadata)[0]
  const desc = useShortDescription(incident)
  const [visible, setVisible] = useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const content = (
    <UI.IncidentDrawerContent>
      <UI.IncidentCause>{desc}</UI.IncidentCause>
      <UI.IncidentRootCauses>{'Root cause:'}</UI.IncidentRootCauses>
      {renderNumberedListFromArray(rootCauses)}
    </UI.IncidentDrawerContent>
  )
  const onDrawerOpen = () => {
    setVisible(true)
  }
  return (
    <>
      <UI.DescriptionSpan onClick={onDrawerOpen}>{desc}</UI.DescriptionSpan>
      <Drawer
        title={'Incident Description'}
        visible={visible}
        onClose={onClose}
        children={content}
        style={{ width: 450 }}
      />
    </>
  )
}

export const getCategory = (code?: string) => {
  if (typeof code !== 'string') {
    return <FormatIntlString message={defineMessage({ defaultMessage: '{noDataSymbol}' })} />
  }

  const category = incidentInformation[code].category
  return <FormatIntlString message={category} />
}

export interface GetScopeProps {
  incident: Incident
}

export const GetScope = (props: GetScopeProps) => {
  const { incident } = props
  const scope = useIncidentScope(incident)  
  const message = defineMessage({ defaultMessage: '{scope}' })
  return <FormatIntlString message={message} scope={scope}/>
}
