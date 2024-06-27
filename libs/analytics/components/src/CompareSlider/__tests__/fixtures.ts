import { CloudRRMGraph } from '@acx-ui/components'

/* eslint-disable max-len */
export const sample: CloudRRMGraph = {
  nodes: [
    { apMac: '00:00:00:00:00:00', apName: 'name0', channelWidth: [40], channel: [36], txPower: ['_MIN'] },
    { apMac: '00:00:00:00:00:01', apName: 'name1', channelWidth: [null], channel: [36], txPower: ['_FULL'] },
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