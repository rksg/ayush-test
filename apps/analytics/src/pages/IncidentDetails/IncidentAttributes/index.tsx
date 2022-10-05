import React, { useState } from 'react'

import moment       from 'moment-timezone'
import { useIntl  } from 'react-intl'

import {
  impactValues,
  Incident,
  nodeTypes,
  formattedPath,
  impactedArea
} from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'

import { DescriptionRowProps, DescriptionSection } from '../../../components/DescriptionSection'

import { ImpactedClientsDrawer, ImpactedAPsDrawer } from './ImpactedDrawer'

export enum Attributes {
  ClientImpactCount,
  ApImpactCount,
  IncidentCategory,
  IncidentSubCategory,
  Type,
  Scope,
  Duration,
  EventStartTime,
  EventEndTime
}

export const durationOf = (start: string, end: string) =>
  moment(end).diff(moment(start), 'milliseconds', true)

export function useDrawer (init: string|boolean) {
  const [visible, setVisible] = useState<string|boolean>(init)
  const onClose = () => setVisible(false)
  const onOpen = (type: 'ap'|'client' ) => setVisible(type)
  return { visible, onOpen, onClose }
}

export const IncidentAttributes = ({ incident, visibleFields }: {
  incident: Incident
  visibleFields: Attributes[]
}) => {
  const intl = useIntl()
  const { visible, onOpen, onClose } = useDrawer(false)
  const scope = formattedPath(incident.path, incident.sliceValue)
  const area = impactedArea(incident.path, incident.sliceValue)
  const fields = {
    [Attributes.ClientImpactCount]: {
      key: 'clientImpactCount',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Client Impact Count' }),
        children: impactValues('client', incident).clientImpactDescription,
        onClick: () => onOpen('client')
      })
    },
    [Attributes.ApImpactCount]: {
      key: 'apImpactCount',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'AP Impact Count' }),
        children: impactValues('ap', incident).apImpactDescription,
        onClick: () => onOpen('ap')
      })
    },
    [Attributes.IncidentCategory]: {
      key: 'incidentCategory',
      getValue: (incident: Incident) => ({
        label: 'Incident Category',
        children: intl.$t(incident.category)
      })
    },
    [Attributes.IncidentSubCategory]: {
      key: 'incidentSubCategory',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Incident Sub-Category' }),
        children: intl.$t(incident.subCategory)
      })
    },
    [Attributes.Type]: {
      key: 'type',
      getValue: (incident: Incident) => ({
        label: intl.$t({
          defaultMessage: 'Type',
          description: 'Path node type'
        }),
        children: nodeTypes(incident.sliceType)
      })
    },
    [Attributes.Scope]: {
      key: 'scope',
      getValue: () => ({
        label: intl.$t({
          defaultMessage: 'Scope',
          description: 'Incident impacted scope'
        }),
        children: area,
        tooltip: scope
      })
    },
    [Attributes.Duration]: {
      key: 'duration',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Duration' }),
        children: formatter('durationFormat')(durationOf(
          incident.startTime,
          incident.endTime
        ))
      })
    },
    [Attributes.EventStartTime]: {
      key: 'eventStartTime',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Event Start Time' }),
        children: formatter('dateTimeFormat')(incident.startTime)
      })
    },
    [Attributes.EventEndTime]: {
      key: 'eventEndTime',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Event End Time' }),
        children: formatter('dateTimeFormat')(incident.endTime)
      })
    }
  }

  const computedFields = visibleFields
    .map(key => fields[key].getValue(incident) as DescriptionRowProps)
  return <>
    <DescriptionSection fields={computedFields}/>
    { visible==='ap' && <ImpactedAPsDrawer
      visible={visible==='ap'}
      onClose={onClose}
      id={incident.id}
      impactedCount={incident.impactedApCount as number}
    /> }
    { visible==='client' && <ImpactedClientsDrawer
      visible={visible==='client'}
      onClose={onClose}
      id={incident.id}
      impactedCount={incident.impactedClientCount as number}
    /> }
  </>
}
