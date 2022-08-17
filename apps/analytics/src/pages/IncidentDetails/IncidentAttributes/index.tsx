import React, { useState } from 'react'

import moment       from 'moment-timezone'
import { useIntl  } from 'react-intl'

import {
  impactValues,
  Incident,
  nodeTypes,
  useFormattedPath,
  useImpactedArea
} from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'

import { DescriptionRowProps, DescriptionSection } from '../../../components/DescriptionSection'

import { ImpactedClientsDrawer, ImpactedAPsDrawer } from './ImpactedDrawer'

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
  visibleFields: string[]
}) => {
  const intl = useIntl()
  const { visible, onOpen, onClose } = useDrawer(false)
  const scope = useFormattedPath(incident.path, incident.sliceValue)
  const impactedArea = useImpactedArea(incident.path, incident.sliceValue)
  const fields = [
    {
      key: 'clientImpactCount',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Client Impact Count' }),
        children: impactValues(intl, 'client', incident).clientImpactDescription,
        onClick: () => onOpen('client')
      })
    },
    {
      key: 'apImpactCount',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'AP Impact Count' }),
        children: impactValues(intl, 'ap', incident).apImpactDescription,
        onClick: () => onOpen('ap')
      })
    },
    {
      key: 'incidentCategory',
      getValue: (incident: Incident) => ({
        label: 'Incident Category',
        children: intl.$t(incident.category)
      })
    },
    {
      key: 'incidentSubCategory',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Incident Sub-Category' }),
        children: intl.$t(incident.subCategory)
      })
    },
    {
      key: 'type',
      getValue: (incident: Incident) => ({
        label: intl.$t({
          defaultMessage: 'Type',
          description: 'Path node type'
        }),
        children: intl.$t(nodeTypes(incident.sliceType))
      })
    },
    {
      key: 'scope',
      getValue: () => ({
        label: intl.$t({
          defaultMessage: 'Scope',
          description: 'Incident impacted scope'
        }),
        children: impactedArea,
        title: scope
      })
    },
    {
      key: 'duration',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Duration' }),
        children: formatter('durationFormat')(durationOf(
          incident.startTime,
          incident.endTime
        ))
      })
    },
    {
      key: 'eventStartTime',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Event Start Time' }),
        children: formatter('dateTimeFormat')(incident.startTime)
      })
    },
    {
      key: 'eventEndTime',
      getValue: (incident: Incident) => ({
        label: intl.$t({ defaultMessage: 'Event End Time' }),
        children: formatter('dateTimeFormat')(incident.endTime)
      })
    }
  ]

  const computedFields = fields
    .filter(({ key }) => visibleFields.includes(key))
    .map(({ getValue }) => getValue(incident) as DescriptionRowProps)
  return <>
    <DescriptionSection fields={computedFields}/>
    { visible==='ap' &&
      <ImpactedAPsDrawer visible={visible==='ap'} onClose={onClose} id={incident.id} /> }
    { visible==='client' &&
      <ImpactedClientsDrawer visible={visible==='client'} onClose={onClose} id={incident.id} /> }
  </>
}
