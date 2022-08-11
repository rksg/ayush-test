import React, { useState } from 'react'

import moment                from 'moment-timezone'
import { FormattedMessage  } from 'react-intl'

import type { IncidentAttributesProps }                            from '@acx-ui/analytics/utils'
import { noDataSymbol }                                            from '@acx-ui/analytics/utils'
import { useFormattedPath, useFormattedNodeType, useImpactedArea } from '@acx-ui/analytics/utils'
import { formatter }                                               from '@acx-ui/utils'

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
    const impact = impactedCount / count
    const formattedImpact = formatter('percentFormat')(impact)
    return {
      [`${type}Impact`]: impact,
      [`${type}ImpactFormatted`]: formattedImpact,
      [`${type}ImpactCountFormatted`]: formatter('countFormat')(impactedCount),
      [`${type}ImpactDescription`]: <FormattedMessage
        defaultMessage='{impactedCount} of {count} {type}{isPlural} ({impact})'
        values={{
          impactedCount,
          count,
          type: type === 'ap' ? type.toUpperCase() : type,
          isPlural: count > 1 ? 's' : '',
          impact: formattedImpact
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
  const { visible, onOpen, onClose } = useDrawer(false)
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
        children: details.category
      })
    },
    {
      key: 'incidentSubCategory',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Incident Sub-Category',
        children: details.subCategory
      })
    },
    {
      key: 'type',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Type',
        children: useFormattedNodeType(details.sliceType)
      })
    },
    {
      key: 'scope',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Scope',
        children: useImpactedArea(details.path, details.sliceValue),
        title: useFormattedPath(details.path, details.sliceValue)
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
