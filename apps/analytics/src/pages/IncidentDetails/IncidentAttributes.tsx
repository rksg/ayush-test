import React, { useState } from 'react'

import moment from 'moment-timezone'

// import { useIntl, FormattedMessage } from 'react-intl'
import { NetworkNodeTypeForDisplay, noDataSymbol } from '@acx-ui/analytics/utils'
import { Drawer }                                  from '@acx-ui/components'
import { formatter }                               from '@acx-ui/utils'

import { AttributeRowProps, AttributesSection } from '../../components/AttributesSection'

import { ImpactedAPsTable }     from './ImpactedTable/ImpactedAPsTable'
import { ImpactedClientsTable } from './ImpactedTable/ImpactedClientsTable'

import type { PathNode, IncidentAttributesProps } from './types'

const durationOf = (start: string, end: string) =>
  moment(end).diff(moment(start), 'milliseconds', true)

export const formattedNodeName = (node: PathNode, sliceValue: string) =>
  ['ap', 'controller', 'switch'].includes(node.type.toLowerCase()) && sliceValue !== node.name
    ? `${sliceValue} (${node.name})`
    : node.name

export const formattedSliceType = (type: string) =>
  NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type
// useIntl().$t({
//   defaultMessage: NetworkNodeTypeForDisplay[type as keyof typeof NetworkNodeTypeForDisplay] || type
// })

export const formattedPath = (path: IncidentAttributesProps['path'], sliceValue: string) => path
  .map(node => `${formattedNodeName(node, sliceValue)} (${formattedSliceType(node.type)})`)
  .join('\n> ')

export const getImpactedArea = (path: IncidentAttributesProps['path'], sliceValue: string) => {
  const lastNode = path[path.length - 1]
  return lastNode
    ? formattedNodeName(lastNode, sliceValue)
    : sliceValue
}

export const getImpactValues = (type: string, count: number, impactedCount: number) => {
  // const { $t } = useIntl()
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
      [`${type}ImpactDescription`]: 'Calculating...'
      // [`${type}ImpactDescription`]: $t({ defaultMessage: 'Calculating...' })
    }
  } else {
    const impact = impactedCount / count
    const formattedImpact = formatter('percentFormat')(impact)
    return {
      [`${type}Impact`]: impact,
      [`${type}ImpactFormatted`]: formattedImpact,
      [`${type}ImpactCountFormatted`]: formatter('countFormat')(impactedCount),
      [`${type}ImpactDescription`]: `${type}ImpactDescription` //todo
      // $t({
      //   defaultMessage: '{{impactedCount}} of {{count}} {{type}}{{isPlural}} ({{impact}})'
      //   // {
      //   //   impactedCount,
      //   //   count,
      //   //   type: type === 'ap' ? type.toUpperCase() : type,
      //   //   isPlural: count > 1 ? 's' : '',
      //   //   impact: formattedImpact
      //   // }
      // })
    }
  }
}

export const IncidentAttributes = (props: IncidentAttributesProps) => {
  const [visible, setVisible] = useState<string|boolean>(false)
  const onClose = () => {
    setVisible(false)
  }
  const onOpen = (type: 'ap'|'client' ) => {
    setVisible(type)
  }
  const fields = [
    (details: IncidentAttributesProps) => ({
      label: 'Client Impact Count',
      children: getImpactValues(
        'client', details.clientCount, details.impactedClientCount).clientImpactDescription,
      onClick: () => onOpen('client')
      // popover: details.impactedClientCount > 0 ? <ClientImpactPopover /> : null
    }),
    (details: IncidentAttributesProps) => ({
      label: 'AP Impact Count',
      children: getImpactValues('ap', details.apCount, details.impactedApCount).apImpactDescription,
      onClick: () => onOpen('ap')
      // popover: details.impactedApCount > 0 ? <APImpactPopover /> : null
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Incident Category',
      children: details.category
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Incident Sub-Category',
      children: details.subCategory
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Type',
      children: getImpactedArea(details.path, details.sliceValue)
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Scope',
      children: getImpactedArea(details.path, details.sliceValue),
      title: formattedPath(details.path, details.sliceValue)
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Duration',
      children: formatter('durationFormat')(durationOf(details.startTime, details.endTime))
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Event Start Time',
      children: formatter('dateTimeFormat')(details.startTime)
    }),
    (details: IncidentAttributesProps) => ({
      label: 'Event End Time',
      children: formatter('dateTimeFormat')(details.endTime)
    })
  ]

  const computedFields = fields
    .map(field => field(props) as AttributeRowProps)
  return <>
    <AttributesSection fields={computedFields}/>
    <Drawer
      title={visible === 'ap' ? 'Impacted AP': 'Impacted Client'}
      visible={!!visible}
      onClose={onClose}
      children={visible === 'ap'
        ? <ImpactedAPsTable {...props}/> : <ImpactedClientsTable {...props}/>}
    />
  </>
}
