import React, { useState } from 'react'

import moment                         from 'moment-timezone'
import { FormattedMessage, useIntl  } from 'react-intl'

import { noDataSymbol, nodeTypes, useFormattedPath, useImpactedArea } from '@acx-ui/analytics/utils'
import type { IncidentAttributesProps }                               from '@acx-ui/analytics/utils'
import { formatter }                                                  from '@acx-ui/utils'

import { DescriptionRowProps, DescriptionSection } from '../../../components/DescriptionSection'

import { ImpactedClientsDrawer, ImpactedAPsDrawer } from './ImpactedDrawer'



export const durationOf = (start: string, end: string) =>
  moment(end).diff(moment(start), 'milliseconds', true)

export const impactValues = (type: string, count: number|null, impactedCount: number|null) => {
  if (
    count === -1 || impactedCount === -1 ||
    count === 0 || impactedCount === 0
  ) {
    return {
      [`${type}Impact`]: noDataSymbol,
      [`${type}ImpactFormatted`]: noDataSymbol,
      [`${type}ImpactCountFormatted`]: noDataSymbol,
      [`${type}ImpactDescription`]: noDataSymbol
    }
  } else if (count === null || impactedCount === null) {
    return {
      [`${type}Impact`]: null,
      [`${type}ImpactFormatted`]: '',
      [`${type}ImpactCountFormatted`]: '',
      [`${type}ImpactDescription`]: <FormattedMessage defaultMessage='Calculating...'/>
    }
  } else {
    const percentage = impactedCount / count
    const formattedImpact = formatter('percentFormat')(percentage)
    return {
      [`${type}Impact`]: percentage,
      [`${type}ImpactFormatted`]: formattedImpact,
      [`${type}ImpactCountFormatted`]: formatter('countFormat')(impactedCount),
      [`${type}ImpactDescription`]: <FormattedMessage
        defaultMessage={`
          {count} of {total} {type, select,
            ap {{total, plural, one {AP} other {APs}}}
            client {{total, plural, one {client} other {clients}}}
            other {Unknown}
          }
          ({percentage, number, ::percent .##})
        `}
        values={{
          type,
          percentage,
          count: impactedCount,
          total: count
        }}
      />
    }
  }
}

export function useDrawer (init: string|boolean) {
  const [visible, setVisible] = useState<string|boolean>(init)
  const onClose = () => setVisible(false)
  const onOpen = (type: 'ap'|'client' ) => setVisible(type)
  return { visible, onOpen, onClose }
}

export const IncidentAttributes = (props: IncidentAttributesProps) => {
  const { $t } = useIntl()
  const { visible, onOpen, onClose } = useDrawer(false)
  const scope = useFormattedPath(props.path, props.sliceValue)
  const impactedArea = useImpactedArea(props.path, props.sliceValue)
  const fields = [
    {
      key: 'clientImpactCount',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Client Impact Count',
        children: impactValues(
          'client',
          details.clientCount,
          details.impactedClientCount
        ).clientImpactDescription,
        onClick: () => onOpen('client')
      })
    },
    {
      key: 'apImpactCount',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'AP Impact Count',
        children: impactValues(
          'ap', details.apCount, details.impactedApCount).apImpactDescription,
        onClick: () => onOpen('ap')
      })
    },
    {
      key: 'incidentCategory',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Incident Category',
        children: $t(details.category)
      })
    },
    {
      key: 'incidentSubCategory',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Incident Sub-Category',
        children: $t(details.subCategory)
      })
    },
    {
      key: 'type',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Type',
        children: $t(nodeTypes(details.sliceType))
      })
    },
    {
      key: 'scope',
      getValue: () => ({
        label: 'Scope',
        children: impactedArea,
        title: scope
      })
    },
    {
      key: 'duration',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Duration',
        children: formatter('durationFormat')(durationOf(
          details.startTime,
          details.endTime
        ))
      })
    },
    {
      key: 'eventStartTime',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Event Start Time',
        children: formatter('dateTimeFormat')(details.startTime)
      })
    },
    {
      key: 'eventEndTime',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Event End Time',
        children: formatter('dateTimeFormat')(details.endTime)
      })
    }
  ]

  const computedFields = fields
    .filter(({ key }) => props.visibleFields.includes(key))
    .map(({ getValue }) => getValue(props) as DescriptionRowProps)
  return <>
    <DescriptionSection fields={computedFields}/>
    { visible==='ap' &&
      <ImpactedAPsDrawer visible={visible==='ap'} onClose={onClose} {...props}/> }
    { visible==='client' &&
      <ImpactedClientsDrawer visible={visible==='client'} onClose={onClose} {...props}/> }
  </>
}
