import _                                                               from 'lodash'
import { unparse }                                                     from 'papaparse'
import { renderToString }                                              from 'react-dom/server'
import { FormattedMessage, IntlShape, RawIntlProvider, defineMessage } from 'react-intl'

import { formatter }              from '@acx-ui/formatter'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { cssStr }         from '../../theme/helper'
import { TooltipWrapper } from '../Chart'

import channelGroupOf24gMap from './mapping/channelGroupOf24gMap.json'
import channelGroupOf5gMap  from './mapping/channelGroupOf5gMap.json'
import channelGroupOf6gMap  from './mapping/channelGroupOf6gMap.json'
import * as Type            from './type'

export function band2radio (band: Type.BandEnum, index: number) {
  const map = {
    [Type.BandEnum._2_4_GHz]: ['2.4'],
    [Type.BandEnum._5_GHz]: ['5', '6(5)'],
    [Type.BandEnum._6_GHz]: ['6(5)']
  }
  return map[band][index]
}

export const recommendationBandMapping = {
  'c-crrm-channel24g-auto': Type.BandEnum._2_4_GHz,
  'c-crrm-channel5g-auto': Type.BandEnum._5_GHz,
  'c-crrm-channel6g-auto': Type.BandEnum._6_GHz
}

export interface TooltipFormatterProps {
  dataType: string
  data: Type.ProcessedCloudRRMNode
}

export const tooltipFormatter = (params: TooltipFormatterProps) => {
  const intl = getIntl()
  const showTooltip = params.dataType === 'node' && params.data.showTooltip
  const showTxPower = params.dataType === 'node' && params.data.category === 'txPower'
  if (!showTooltip) return null

  const variables = params.data.aggregate.map((set, index) => ({
    radio: formatter('radioFormat')(band2radio(params.data.band, index)),
    channel: set.channel,
    bandwidth: formatter('bandwidthFormat')(set.channelWidth),
    highlighted: set.highlighted,
    txPower: formatter('txFormat')(set.txPower)
  }))
  return renderToString(
    <RawIntlProvider value={intl}>
      <TooltipWrapper>
        <ul>
          <FormattedMessage
            defaultMessage='AP Name: <b>{apName}</b>'
            values={{
              ..._.pick(params.data, 'apName'),
              b: (contents) => <b>{contents}</b>
            }}
          />
          <li>{variables.map(vars => <FormattedMessage
            defaultMessage='Channl number (radio {radio}): <b>{channel}</b>'
            values={{
              ..._.pick(vars, ['radio', 'channel']),
              b: (contents) => <b>{contents}</b>
            }}
          />)}</li>
          <li>{variables.map(vars => <FormattedMessage
            defaultMessage='Bandwidth (radio {radio}): <b>{bandwidth}</b>'
            values={{
              ..._.pick(vars, ['radio', 'bandwidth']),
              b: (contents) => <b>{contents}</b>
            }}
          />)}</li>
          {showTxPower && <li>{variables.map(vars => <FormattedMessage
            defaultMessage='TxPower (radio {radio}): <b>{txPower}</b>'
            values={{
              ..._.pick(vars, ['radio', 'txPower']),
              b: (contents) => <b>{contents}</b>
            }}
          />)}</li>}
        </ul>
      </TooltipWrapper>
    </RawIntlProvider>
  )
}

export const channelGroupMapping = {
  [Type.BandEnum._2_4_GHz]: channelGroupOf24gMap,
  [Type.BandEnum._5_GHz]: channelGroupOf5gMap,
  [Type.BandEnum._6_GHz]: channelGroupOf6gMap
}

export const categoryStyles = {
  [Type.CategoryState.Normal]: {
    color: cssStr('--acx-neutrals-50'),
    emphasisColor: cssStr('--acx-neutrals-50'),
    lineStyle: Type.LineStyle.Solid,
    legendText: defineMessage({ defaultMessage: 'No interfering links' })
  },
  [Type.CategoryState.Highlight]: {
    color: cssStr('--acx-semantics-red-50'),
    emphasisColor: cssStr('--acx-semantics-red-30'),
    lineStyle: Type.LineStyle.Solid,
    legendText: defineMessage({ defaultMessage: 'Has interfering links' })
  },
  [Type.CategoryState.TxPower]: {
    color: cssStr('--acx-accents-orange-50'), //30
    emphasisColor: cssStr('--acx-accents-orange-30'), //25
    lineStyle: Type.LineStyle.Dotted,
    legendText: defineMessage({ defaultMessage: 'Reduction in transmit power' })
  }
}

export const bandwidthSizeMapping: Record<string|number, number> = {
  Unknown: 24,
  20: 24,
  40: 36,
  80: 48,
  160: 60
}

export const bandwidthMapping = {
  [Type.BandEnum._2_4_GHz]: ['40', '20'],
  [Type.BandEnum._5_GHz]: ['80', '40', '20'],
  [Type.BandEnum._6_GHz]: ['160', '80', '40', '20']
}

export function deriveInterfering (
  graph: Type.CloudRRMGraph, band: Type.BandEnum
) : Type.ProcessedCloudRRMGraph {
  const nodeWithGroup = graph.nodes
    .map(node => {
      const aggregate = node.channelWidth.map((channelWidth, index) => {
        const map = channelGroupMapping[band].find(map =>
          channelWidth !== 'NaN' && map.channelWidth === channelWidth.toString())?.channelGroups
        // get group based on current node channel
        const group = map && map.find(group => group.channel === node.channel[index])?.group
        // get all channels in the same group
        const channelList = map
          ? map.filter(row => row.group === group).map(row => row.channel)
          : channelWidth === 'NaN' ? [] : [node.channel[index]]
        return {
          channelWidth,
          channel: node.channel[index],
          txPower: node.txPower[index],
          group,
          channelList
        }
      })
      return { ...node, aggregate }
    })
  const processedNodes = nodeWithGroup.map(node => {
    const neighborIds = graph.links.map(({ source, target }) => {
      if (source === node.apMac) return target
      if (target === node.apMac) return source
      return ''
    }).filter(Boolean)
    const neighbors = nodeWithGroup.filter(node => neighborIds.includes(node.apMac))
    const processed = node.aggregate.map(set => {
      const highlighted = neighbors
        .some(neighbor => neighbor.aggregate
          .some(neighborSet => _.intersection(set.channelList, neighborSet.channelList).length > 0))
      return { ...set, highlighted }
    })
    const highlighted = graph.interferingLinks
      ? graph.interferingLinks.map(link => link.split('-')).flat().includes(node.apMac)
      : processed.some(set => set.highlighted)
    const channelWidthList = node.channelWidth.filter(v => v !== 'NaN') as number[]
    const sizeType = channelWidthList.length > 0
      ? Math.max(...channelWidthList)
      : 'Unknown'
    return {
      ...node,
      aggregate: processed,
      band,
      id: node.apMac,
      name: node.apName,
      symbolSize: bandwidthSizeMapping[sizeType],
      value: node.channel,
      category: highlighted ? Type.CategoryState.Highlight : Type.CategoryState.Normal
    }
  })
  const processedLinks = graph.links.map(link => {
    const sourceNode = processedNodes.find(n => n.id === link.source)
    const targetNode = processedNodes.find(n => n.id === link.target)
    const sourceChannelList = sourceNode
      ? sourceNode.aggregate.map(set => set.channelList).flat() : []
    const targetChannelList = targetNode
      ? targetNode.aggregate.map(set => set.channelList).flat() : []
    const highlighted = graph.interferingLinks
      ? (_.intersection(
        graph.interferingLinks,
        [`${link.source}-${link.target}`, `${link.target}-${link.source}`]
      ).length > 0)
      : (_.intersection(sourceChannelList, targetChannelList).length > 0)
    return {
      ...link,
      category: highlighted ? Type.CategoryState.Highlight : Type.CategoryState.Normal
    }
  })
  return {
    nodes: processedNodes,
    links: processedLinks,
    categories: [
      { name: Type.CategoryState.Highlight },
      { name: Type.CategoryState.Normal },
      { name: Type.CategoryState.TxPower }
    ]
  }
}

export function deriveInterferingGraphs (
  graphs: Type.CloudRRMGraph[], band: Type.BandEnum
) : Type.ProcessedCloudRRMGraph[] {
  return graphs.map(graph => deriveInterfering(graph, band))
}

export function trimGraph (
  graph: Type.ProcessedCloudRRMGraph, maxNumNode: number = 500
) : Type.ProcessedCloudRRMGraph {
  const { highlight = [], normal = [] } = _.groupBy(graph.nodes, node =>
    node.category === Type.CategoryState.Normal
      ? Type.CategoryState.Normal : Type.CategoryState.Highlight)

  const left = maxNumNode - highlight.length
  const trimmedNodes = [
    ...(left > 0 && normal.length > 0 ? normal.slice(0, left) : []),
    ...highlight
  ]
  const ids = trimmedNodes.map(node => node.id)
  const trimedLinks = graph.links
    .filter(link => ids.includes(link.source) && ids.includes(link.target))
  return { ...graph, nodes: trimmedNodes, links: trimedLinks }
}

export function trimPairedGraphs (
  graphs: Type.ProcessedCloudRRMGraph[],
  maxNumNode?: number
) : Type.ProcessedCloudRRMGraph[] {
  const trimmedGraphs = graphs.map(graph => trimGraph(graph, maxNumNode))
  const nodeList = trimmedGraphs[0].nodes.map(node => node.id)
  const sortedNode = [
    ...(nodeList
      .map(id => trimmedGraphs[1].nodes.find(n => n.id === id))
      .filter(Boolean) as Type.ProcessedCloudRRMNode[]),
    ...(trimmedGraphs[1].nodes.filter(node => !nodeList.includes(node.id)))
  ]
  return [ trimmedGraphs[0], { ...trimmedGraphs[1], nodes: sortedNode } ]
}

export function pairGraphs (graphs: Type.ProcessedCloudRRMGraph[]) : Type.ProcessedCloudRRMGraph[] {
  const allNodeIds = _.uniq([
    ...graphs[0].nodes.map(node => node.id),
    ...graphs[1].nodes.map(node => node.id)
  ])

  let primaryGraph: Type.ProcessedCloudRRMNode[] = [],
    secondaryGraph: Type.ProcessedCloudRRMNode[] = []

  allNodeIds.forEach(id => {
    let primaryNode = graphs[0].nodes.find(node => node.id === id)
    let secondaryNode = graphs[1].nodes.find(node => node.id === id)

    if (primaryNode && secondaryNode &&
      !(primaryNode.category === Type.CategoryState.Normal &&
        secondaryNode.category === Type.CategoryState.Normal)) {
      primaryNode = { ...primaryNode, showTooltip: true }
      secondaryNode = { ...secondaryNode, showTooltip: true }
    }

    primaryNode && primaryGraph.push(primaryNode)
    secondaryNode && secondaryGraph.push({
      ...secondaryNode,
      value: primaryNode?.value || secondaryNode?.value
    })
  })

  return [
    { ...graphs[0], nodes: primaryGraph },
    { ...graphs[1], nodes: secondaryGraph }
  ]
}

export function deriveTxPowerHighlight (
  graphs: Type.ProcessedCloudRRMGraph[]
) {
  const allNodeIds = _.uniq([
    ...graphs[0].nodes.map(node => node.id),
    ...graphs[1].nodes.map(node => node.id)
  ])

  let processedNodes = [[], []] as Type.ProcessedCloudRRMNode[][]
  let processedLinks = graphs.map(graph => graph.links)
  allNodeIds.forEach(id => {
    let nodes = [
      graphs[0].nodes.find(node => node.id === id),
      graphs[1].nodes.find(node => node.id === id)
    ]

    if (nodes.every(node => !!node)) {
      nodes[1]!.aggregate.forEach((agg, index) => {
        if (agg.txPower &&
            nodes[0]!.aggregate[index].txPower &&
            agg.txPower !== nodes[0]!.aggregate[index].txPower) {
          // update node category
          nodes = [ { ...nodes[0]! }, { ...nodes[1]!, category: Type.CategoryState.TxPower } ]

          // update edge category
          processedLinks = [
            processedLinks[0],
            processedLinks[1].map(link =>
              (link.source === nodes[1]!.id || link.target === nodes[1]!.id) &&
                link.category === Type.CategoryState.Highlight
                ? { ...link, category: Type.CategoryState.TxPower }
                : link
            )
          ]
        }
      })
    }

    nodes.forEach((node, index) => {
      node && processedNodes[index].push(node)
    })
  })

  return graphs.map((graph, index) => ({
    ...graph, nodes: processedNodes[index], links: processedLinks[index]
  }))
}

export function getCrrmCsvData (graphs: Type.ProcessedCloudRRMGraph[], $t: IntlShape['$t']) {
  const beforeNodes = _.keyBy(graphs[0].nodes, 'apMac')
  const afterNodes = _.keyBy(graphs[1].nodes, 'apMac')
  const macs = Array.from(new Set([..._.keys(beforeNodes), ..._.keys(afterNodes)]))

  const data = macs.flatMap((mac) => {
    const before = beforeNodes[mac]
    const after = afterNodes[mac]
    const name = after?.name ?? before?.name
    const apMac = after?.apMac ?? before?.apMac
    const size = before?.channel.length ?? after?.channel.length
    const placeholder = Array(size).fill(null)
    const channel = _.zip(before?.channel ?? placeholder, after?.channel ?? placeholder)
    const channelWidth = _.zip(
      before?.channelWidth ?? placeholder,
      after?.channelWidth ?? placeholder
    )
    const txPower = _.zip(before?.txPower ?? placeholder, after?.txPower ?? placeholder)

    const agg = []
    for (let i = 0; i < size; i++) {
      const bandwidthBefore = formatter('bandwidthFormat')(channelWidth[i][0])
      const bandwidthAfter = formatter('bandwidthFormat')(channelWidth[i][1])
      const txFormatBefore = formatter('txFormat')(txPower[i][0])
      const txFormatAfter = formatter('txFormat')(txPower[i][1] ?? (after && txPower[i][0]))
      agg.push([
        name,
        apMac,
        formatter('radioFormat')(band2radio(before?.band ?? after?.band, i)),
        channel[i][0],
        channel[i][1],
        bandwidthBefore === noDataDisplay ? '' : bandwidthBefore,
        bandwidthAfter === noDataDisplay ? '' : bandwidthAfter,
        txFormatBefore === noDataDisplay ? '' : txFormatBefore,
        txFormatAfter === noDataDisplay ? '' : txFormatAfter
      ])
    }
    return agg
  })

  return unparse([[
    $t({ defaultMessage: 'AP Name' }),
    $t({ defaultMessage: 'AP MAC' }),
    $t({ defaultMessage: 'WiFi Radio Band' }),
    $t({ defaultMessage: '[Before] Channel Number' }),
    $t({ defaultMessage: '[After] Channel Number' }),
    $t({ defaultMessage: '[Before] Bandwidth' }),
    $t({ defaultMessage: '[After] Bandwidth' }),
    $t({ defaultMessage: '[Before] TxPower' }),
    $t({ defaultMessage: '[After] TxPower' })
  ], ...data])
}