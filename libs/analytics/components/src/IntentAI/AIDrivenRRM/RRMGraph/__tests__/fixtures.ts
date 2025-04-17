import { BandEnum, ProcessedCloudRRMGraph } from '@acx-ui/components'

const hex = (num: number) => num.toString(16).padStart(2, '0').toUpperCase()

const gen = {
  node: (num: number, channels: number[], bandwidths: number[], txPowers: (string|null)[]) => {
    return {
      apMac: `00:00:00:00:00:${hex(num)}`,
      name: `AP ${num}`,
      channelWidth: bandwidths,
      channel: channels,
      txPower: txPowers,
      band: BandEnum._5_GHz
    }
  },
  link: (source: number, target: number) => ({
    source: `00:00:00:00:00:${hex(source)}`,
    target: `00:00:00:00:00:${hex(target)}`
  }),
  interfering: (source: number, target: number) =>
    `00:00:00:00:00:${hex(source)}-00:00:00:00:00:${hex(target)}`,
  nodes: (nodes: [number, number[], number[], (string|null)[]][]) =>
    nodes.map((values) => gen.node(...values)),
  links: (links: [number, number][]) =>
    links.map((values) => gen.link(...values)),
  interferings: (links: [number, number][]) =>
    links.map((values) => gen.interfering(...values))
}

export const mockCrrmData = [
  {
    nodes: gen.nodes([
      [1, [36], [80], ['_FULL']],
      [2, [36], [80], ['_FULL']]
    ]),
    links: gen.links([[1, 2]]),
    interferingLinks: gen.interferings([[1, 2]]),
    neighborAP: {
      interfering: 1,
      nonInterfering: 1,
      rogue: 3
    }
  },
  {
    nodes: gen.nodes([
      [1, [36], [40], ['_FULL']],
      [2, [52], [40], ['_3DB']]
    ]),
    links: gen.links([[1, 2]]),
    interferingLinks: gen.interferings([]),
    neighborAP: {
      interfering: 0,
      nonInterfering: 2,
      rogue: 3
    }
  }
] as unknown as ProcessedCloudRRMGraph[]