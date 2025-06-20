import { useState } from 'react'

import { TooltipPlacement } from 'antd/es/tooltip'
import moment               from 'moment-timezone'
import { useIntl  }         from 'react-intl'

import {
  impactValues,
  Incident,
  nodeTypes,
  formattedPath,
  impactedArea
} from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { DescriptionRowProps, DescriptionSection } from '../../DescriptionSection'

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
  EventEndTime,
  DataStartTime,
  DataEndTime,
  Visibility
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
  const { $t } = useIntl()
  const { visible, onOpen, onClose } = useDrawer(false)
  const fields = {
    [Attributes.ClientImpactCount]: {
      key: 'clientImpactCount',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Client Impact Count' }),
        children: impactValues('client', incident).clientImpactDescription,
        ...((incident.impactedClientCount! > 0 && incident.clientCount! > 0 )
          ? { onClick: () => onOpen('client') } : {})
      })
    },
    [Attributes.ApImpactCount]: {
      key: 'apImpactCount',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'AP Impact Count' }),
        children: impactValues('ap', incident).apImpactDescription,
        ...((incident.impactedApCount! > 0 && incident.apCount! > 0 )
          ? { onClick: () => onOpen('ap') } : {})
      })
    },
    [Attributes.IncidentCategory]: {
      key: 'incidentCategory',
      getValue: (incident: Incident) => ({
        label: 'Incident Category',
        children: $t(incident.category)
      })
    },
    [Attributes.IncidentSubCategory]: {
      key: 'incidentSubCategory',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Incident Sub-Category' }),
        children: $t(incident.subCategory)
      })
    },
    [Attributes.Type]: {
      key: 'type',
      getValue: (incident: Incident) => ({
        label: $t({
          defaultMessage: 'Type',
          description: 'Path node type'
        }),
        children: nodeTypes(incident.sliceType)
      })
    },
    [Attributes.Scope]: {
      key: 'scope',
      getValue: () => ({
        label: $t({
          defaultMessage: 'Scope',
          description: 'Incident impacted scope'
        }),
        children: impactedArea(incident.path, incident.sliceValue),
        tooltip: formattedPath(incident.path, incident.sliceValue),
        tooltipPlacement: 'right' as TooltipPlacement
      })
    },
    [Attributes.Duration]: {
      key: 'duration',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Duration' }),
        children: formatter('durationFormat')(durationOf(
          incident.startTime,
          incident.endTime
        ))
      })
    },
    [Attributes.EventStartTime]: {
      key: 'eventStartTime',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Event Start Time' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(incident.startTime)
      })
    },
    [Attributes.EventEndTime]: {
      key: 'eventEndTime',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Event End Time' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(incident.endTime)
      })
    },
    [Attributes.DataStartTime]: {
      key: 'dataStartTime',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Data Start Time' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(incident.impactedStart)
      })
    },
    [Attributes.DataEndTime]: {
      key: 'dataEndTime',
      getValue: (incident: Incident) => ({
        label: $t({ defaultMessage: 'Data End Time' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(incident.impactedEnd)
      })
    },
    [Attributes.Visibility]: {
      key: 'isMuted',
      getValue: ({ isMuted }: Incident) => ({
        label: $t({ defaultMessage: 'Visibility' }),
        children: isMuted
          ? $t({ defaultMessage: 'Muted' })
          : $t({ defaultMessage: 'Unmuted' })
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
      impactedStart={incident.impactedStart}
      impactedEnd={incident.impactedEnd}
    /> }
    { visible==='client' && <ImpactedClientsDrawer
      visible={visible==='client'}
      onClose={onClose}
      id={incident.id}
      startTime={incident.startTime}
      endTime={incident.endTime}
      impactedCount={incident.impactedClientCount as number}
      impactedStart={incident.impactedStart}
      impactedEnd={incident.impactedEnd}
    /> }
  </>
}
