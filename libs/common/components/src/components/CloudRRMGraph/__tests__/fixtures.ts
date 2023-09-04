import { channelGroupMapping } from '../helper'
import * as Type               from '../type'

const mockTxPower = (numRecord: number) => {
  const txPower = [
    null, '_MIN', '_FULL', '_1DB', '_2DB', '_3DB',
    '_4DB', '_5DB', '_6DB', '_7DB', '_8DB', '_9DB', '_10DB'
  ]
  return Array(numRecord)
    .fill(0).map(() => txPower[Math.floor(Math.random() * 100 % txPower.length)])
}

const mockChannelWidth = (band: Type.BandEnum, numRecord: number) => {
  const channelWidthList = channelGroupMapping[band]
    .map(map => map.channelWidth)
    .filter(width => !width.includes('_'))
  return Array(numRecord).fill(0).map(() =>
    parseInt(channelWidthList[Math.floor(Math.random() * 100 % channelWidthList.length)], 10))
}

const mockChannel = (band: Type.BandEnum, channelWidth: number[]) => {
  let channels = [] as number[]
  for(let index = 0; channels.length < channelWidth.length; ) {
    const mapping = channelGroupMapping[band]
      .find(map => map.channelWidth === channelWidth[index].toString())!.channelGroups
      .map(row => row.channel)
    const channel = mapping[Math.floor(Math.random() * 100 % mapping.length)]
    if (!channels.includes(channel)) {
      channels.push(channel)
      index++
    }
  }
  return channels
}

export const mockCloudRRMGraphData = (
  band: Type.BandEnum, numNode: number, numLink: number, numInterfering: number
) => {
  const nodes = new Array(numNode).fill(0).map((_, index) => {
    const dual = !Math.floor(Math.random() * 100 % 2)
    const channelWidth = mockChannelWidth(band, dual ? 2 : 1)
    const txPower = mockTxPower(dual ? 2 : 1)
    return {
      apMac: `mac${index}`,
      apName: `name${index}`,
      channelWidth,
      channel: mockChannel(band, channelWidth),
      txPower
    }
  })
  const links = new Array(numLink).fill(0).map(() => {
    const source = `mac${Math.floor(Math.random() * numNode)}`
    let target = `mac${Math.floor(Math.random() * numNode)}`
    while (source === target) {
      target = `mac${Math.floor(Math.random() * numNode)}`
    }
    return { source, target }
  })

  const interferingLinks = links.slice(0, numInterfering)
    .map(link => `${link.source}-${link.target}`)

  return { nodes, links, interferingLinks }
}

/* eslint-disable max-len */
export const sample: Type.CloudRRMGraph = {
  nodes: [
    { apMac: '00:00:00:00:00:00', apName: 'name0', channelWidth: [40], channel: [36], txPower: ['_MIN'] },
    { apMac: '00:00:00:00:00:01', apName: 'name1', channelWidth: ['NaN'], channel: [36], txPower: ['_FULL'] },
    { apMac: '00:00:00:00:00:02', apName: 'name2', channelWidth: [40, 80], channel: [36, 100], txPower: ['_1DB', '_2DB'] },
    { apMac: '00:00:00:00:00:03', apName: 'name3', channelWidth: [160], channel: [40], txPower: ['_3DB'] },
    { apMac: '00:00:00:00:00:04', apName: 'name4', channelWidth: [80, 160], channel: [36, 40], txPower: ['_4DB', '_5DB'] },
    { apMac: '00:00:00:00:00:05', apName: 'name5', channelWidth: [40, 80], channel: [36, 40], txPower: ['_6DB', '_7DB'] },
    { apMac: '00:00:00:00:00:06', apName: 'name6', channelWidth: [80, 160], channel: [36, 40], txPower: ['_8DB', '_9DB'] },
    { apMac: '00:00:00:00:00:07', apName: 'name7', channelWidth: [80], channel: [52], txPower: ['_10DB'] },
    { apMac: '00:00:00:00:00:08', apName: 'name8', channelWidth: [20], channel: [36], txPower: ['_MIN'] },
    { apMac: '00:00:00:00:00:09', apName: 'name9', channelWidth: [40], channel: [40], txPower: ['_FULL'] }
  ],
  links: [
    { source: '00:00:00:00:00:03', target: '00:00:00:00:00:08' },
    { source: '00:00:00:00:00:06', target: '00:00:00:00:00:03' },
    { source: '00:00:00:00:00:01', target: '00:00:00:00:00:02' },
    { source: '00:00:00:00:00:02', target: '00:00:00:00:00:03' },
    { source: '00:00:00:00:00:07', target: '00:00:00:00:00:08' },
    { source: '00:00:00:00:00:10', target: '00:00:00:00:00:11' }
  ],
  interferingLinks: ['00:00:00:00:00:03-00:00:00:00:00:08']
}

export const sampleForSortingTest: Type.CloudRRMGraph = {
  ...sample,
  nodes: [
    { apMac: '00:00:00:00:00:04', apName: 'name4', channelWidth: [80, 160], channel: [36, 40], txPower: ['_MIN', '_FULL'] },
    { apMac: '00:00:00:00:00:02', apName: 'name2', channelWidth: [40, 80], channel: [36, 100], txPower: ['_1DB', '_2DB'] },
    { apMac: '00:00:00:00:00:05', apName: 'name5', channelWidth: [40, 80], channel: [36, 40], txPower: ['_3DB', '_4DB'] },
    { apMac: '00:00:00:00:00:01', apName: 'name1', channelWidth: ['NaN'], channel: [36], txPower: ['_5DB'] },
    { apMac: '00:00:00:00:00:06', apName: 'name6', channelWidth: [80, 160], channel: [36, 40], txPower: ['_6DB', '_7DB'] },
    { apMac: '00:00:00:00:00:09', apName: 'name9', channelWidth: [40], channel: [40], txPower: ['_8DB'] },
    { apMac: '00:00:00:00:00:07', apName: 'name7', channelWidth: [80], channel: [52], txPower: ['_9DB'] },
    { apMac: '00:00:00:00:00:03', apName: 'name3', channelWidth: [160], channel: [40], txPower: ['_10DB'] },
    { apMac: '00:00:00:00:00:08', apName: 'name8', channelWidth: [20], channel: [36], txPower: ['_MIN'] },
    { apMac: '00:00:00:00:00:0A', apName: 'extra-node', channelWidth: [20], channel: [36], txPower: ['_FULL'] }
  ]
}

export const sampleForPairingTest: Type.CloudRRMGraph = {
  nodes: [
    ...(sample.nodes),
    { apMac: '00:00:00:00:00:0A', apName: 'extra-node', channelWidth: [20], channel: [36], txPower: ['_MIN'] }
  ],
  links: [
    { source: '00:00:00:00:00:03', target: '00:00:00:00:00:08' },
    { source: '00:00:00:00:00:06', target: '00:00:00:00:00:03' },
    { source: '00:00:00:00:00:01', target: '00:00:00:00:00:02' },
    { source: '00:00:00:00:00:07', target: '00:00:00:00:00:08' },
    { source: '00:00:00:00:00:10', target: '00:00:00:00:00:11' }
  ],
  interferingLinks: null
}

export const sampleGraphsForTxPower: Type.CloudRRMGraph[] = [
  {
    ...sample,
    nodes: [
      { apMac: '00:00:00:00:00:00', apName: 'name0', channelWidth: [40], channel: [36], txPower: ['_MIN'] },
      { apMac: '00:00:00:00:00:01', apName: 'name1', channelWidth: ['NaN'], channel: [36], txPower: ['_FULL'] },
      { apMac: '00:00:00:00:00:02', apName: 'name2', channelWidth: [40, 80], channel: [36, 100], txPower: ['_1DB', '_2DB'] },
      { apMac: '00:00:00:00:00:03', apName: 'name3', channelWidth: [160], channel: [40], txPower: ['_3DB'] },
      { apMac: '00:00:00:00:00:04', apName: 'name4', channelWidth: [80, 160], channel: [36, 40], txPower: ['_4DB', '_5DB'] },
      { apMac: '00:00:00:00:00:05', apName: 'name5', channelWidth: [40, 80], channel: [36, 40], txPower: ['_6DB', '_7DB'] },
      { apMac: '00:00:00:00:00:06', apName: 'name6', channelWidth: [80, 160], channel: [36, 40], txPower: ['_8DB', '_9DB'] },
      { apMac: '00:00:00:00:00:07', apName: 'name7', channelWidth: [20], channel: [36], txPower: ['_10DB'] },
      { apMac: '00:00:00:00:00:08', apName: 'name8', channelWidth: [20], channel: [36], txPower: ['_MIN'] },
      { apMac: '00:00:00:00:00:09', apName: 'name9', channelWidth: [40], channel: [40], txPower: ['_FULL'] }
    ],
    interferingLinks: null
  },
  {
    ...sample,
    nodes: [
      { apMac: '00:00:00:00:00:00', apName: 'name0', channelWidth: [40], channel: [36], txPower: ['_MIN'] },
      { apMac: '00:00:00:00:00:01', apName: 'name1', channelWidth: ['NaN'], channel: [36], txPower: ['_FULL'] },
      { apMac: '00:00:00:00:00:02', apName: 'name2', channelWidth: [40, 80], channel: [36, 100], txPower: ['_9DB', '_2DB'] },
      { apMac: '00:00:00:00:00:03', apName: 'name3', channelWidth: [160], channel: [40], txPower: ['_FULL'] },
      { apMac: '00:00:00:00:00:04', apName: 'name4', channelWidth: [80, 160], channel: [36, 40], txPower: ['_4DB', '_5DB'] },
      { apMac: '00:00:00:00:00:05', apName: 'name5', channelWidth: [40, 80], channel: [36, 40], txPower: ['_6DB', '_7DB'] },
      { apMac: '00:00:00:00:00:06', apName: 'name6', channelWidth: [80, 160], channel: [36, 40], txPower: ['_8DB', '_9DB'] },
      { apMac: '00:00:00:00:00:07', apName: 'name7', channelWidth: [80], channel: [52], txPower: ['_10DB'] },
      { apMac: '00:00:00:00:00:08', apName: 'name8', channelWidth: [20], channel: [36], txPower: ['_MIN'] },
      { apMac: '00:00:00:00:00:09', apName: 'name9', channelWidth: [40], channel: [40], txPower: ['_FULL'] }
    ],
    interferingLinks: null
  }
]
