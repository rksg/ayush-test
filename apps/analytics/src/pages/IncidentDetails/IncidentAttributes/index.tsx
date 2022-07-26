import React, { useState } from 'react'

import moment                from 'moment-timezone'
import { FormattedMessage  } from 'react-intl'

import { PathNode }                                from '@acx-ui/analytics/utils'
import { NetworkNodeTypeForDisplay, noDataSymbol } from '@acx-ui/analytics/utils'
import { formatter }                               from '@acx-ui/utils'

import { DescriptionRowProps, DescriptionSection } from '../../../components/DescriptionSection'

import { ImpactedClientsDrawer, ImpactedAPsDrawer } from './ImpactedDrawer'

import type { IncidentAttributesProps } from '../types'

export const durationOf = (start: string, end: string) =>
  moment(end).diff(moment(start), 'milliseconds', true)

export const formattedNodeName = (node: PathNode, sliceValue: string) =>
  ['ap', 'controller', 'switch'].includes(node.type.toLowerCase()) && sliceValue !== node.name
    ? `${sliceValue} (${node.name})`
    : node.name

export const formattedSliceType = (type: string) =>
  NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type

export const formattedPath = (path: IncidentAttributesProps['path'], sliceValue: string) => path
  .map(node => `${formattedNodeName(node, sliceValue)} (${formattedSliceType(node.type)})`)
  .join('\n> ')

export const getImpactedArea = (path: IncidentAttributesProps['path'], sliceValue: string) => {
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(lastNode, sliceValue)
    : sliceValue
}

export const getImpactValues = (type: string, count: number|null, impactedCount: number|null) => {
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

export const IncidentAttributes = (props: IncidentAttributesProps) => {
  const [visible, setVisible] = useState<string|boolean>(false)
  const onClose = () => setVisible(false)
  const onOpen = (type: 'ap'|'client' ) => setVisible(type)
  const fields = [
    {
      key: 'clientImpactCount',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Client Impact Count',
        children: getImpactValues(
          'client', details.clientCount, details.impactedClientCount).clientImpactDescription,
        onClick: () => onOpen('client')
      })
    },
    {
      key: 'apImpactCount',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'AP Impact Count',
        children: getImpactValues(
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
        children: getImpactedArea(details.path, details.sliceValue)
      })
    },
    {
      key: 'scope',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Scope',
        children: getImpactedArea(details.path, details.sliceValue),
        title: formattedPath(details.path, details.sliceValue)
      })
    },
    {
      key: 'duration',
      getValue: (details: IncidentAttributesProps) => ({
        label: 'Duration',
        children: formatter('durationFormat')(durationOf(details.startTime, details.endTime))
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
    <ImpactedAPsDrawer visible={visible==='ap'} onClose={onClose} {...props}/>
    <ImpactedClientsDrawer visible={visible==='client'} onClose={onClose} {...props}/>
  </>
}
