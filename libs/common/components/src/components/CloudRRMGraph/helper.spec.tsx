import { MessageDescriptor } from 'react-intl'

import { sample, sampleForPairingTest, sampleForSortingTest, sampleGraphsForTxPower } from './__tests__/fixtures'
import {
  band2radio,
  deriveInterfering,
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  getCrrmCsvData,
  pairGraphs,
  tooltipFormatter,
  TooltipFormatterProps,
  trimGraph,
  trimPairedGraphs
} from './helper'
import { BandEnum, CategoryState, CloudRRMGraph, ProcessedCloudRRMGraph } from './type'

describe('band2radio', () => {
  const sets = [
    { params: [BandEnum._2_4_GHz, 0], expected: '2.4' },
    { params: [BandEnum._5_GHz, 0], expected: '5' },
    { params: [BandEnum._5_GHz, 1], expected: '6(5)' },
    { params: [BandEnum._6_GHz, 0], expected: '6(5)' }
  ] as const
  it('converts band to radio', () => {
    for (const { params: [band, index], expected } of sets) {
      expect(band2radio(band, index)).toEqual(expected)
    }
  })
})

describe('tooltipFormatter', () => {
  const params: TooltipFormatterProps = {
    dataType: 'node',
    data: {
      apMac: '00:00:00:00:00:01',
      apName: 'ap',
      channel: [48, 124],
      channelWidth: [20, 40],
      txPower: [ null ],
      aggregate: [{
        channelWidth: 20,
        channel: 48,
        group: 42,
        channelList: [36, 40, 44, 48],
        highlighted: true,
        txPower: '_FULL'
      },
      {
        channelWidth: 40,
        channel: 124,
        group: 122,
        channelList: [116, 120, 124, 128],
        highlighted: false,
        txPower: '_MIN'
      }],
      band: BandEnum._5_GHz,
      id: '00:00:00:00:00:01',
      name: 'ap',
      symbolSize: 48,
      value: [48, 124],
      category: CategoryState.Highlight,
      showTooltip: true
    }
  }

  it('should match snapshot', () => {
    expect(tooltipFormatter(params)).toMatchSnapshot()
  })
  it('should return null when showTooltip is false', () => {
    expect(tooltipFormatter({ ...params, data: { ...params.data, showTooltip: false } })).toBe(null)
  })
  it('should handle when category is txPower', () => {
    expect(tooltipFormatter({
      ...params, data: { ...params.data, category: CategoryState.TxPower }
    })).toMatchSnapshot()
  })
})

describe('deriveInterfering', () => {
  it('should match snapshot', () => {
    expect(deriveInterfering({ ...sample, interferingLinks: null }, BandEnum._5_GHz))
      .toMatchSnapshot()
  })
  it('should match snapshot when interferingLinks is available', () => {
    expect(deriveInterfering(sample, BandEnum._5_GHz)).toMatchSnapshot()
  })
  it('should match snapshot when interferingLinks is empty', () => {
    expect(deriveInterfering({ ...sample, interferingLinks: [] }, BandEnum._5_GHz))
      .toMatchSnapshot()
  })
  it('should handle empty', () => {
    expect(deriveInterfering(
      { nodes: [], links: [], interferingLinks: [] } as CloudRRMGraph, BandEnum._5_GHz
    )).toEqual({
      nodes: [],
      links: [],
      categories: [{ name: 'highlight' }, { name: 'normal' }, { name: 'txPower' }]
    })
  })
})

describe('deriveInterferingGraphs', () => {
  it('should return correct data', () => {
    const singleResult = deriveInterfering(sample, BandEnum._5_GHz)
    expect(deriveInterferingGraphs([sample, sample], BandEnum._5_GHz))
      .toEqual(new Array(2).fill(singleResult))
  })
})

describe('trimGraph', () => {
  it('should return correct trimed graph data', () => {
    const data = deriveInterfering({ ...sample, interferingLinks: null }, BandEnum._5_GHz)
    expect(trimGraph(data).nodes).toEqual([
      ...data.nodes.filter(node => node.category === 'normal'),
      ...data.nodes.filter(node => node.category === 'highlight')
    ])
    expect(trimGraph(data)).toMatchSnapshot()
    expect(trimGraph(data, 8)).toMatchSnapshot()
  })
  it('should handle empty', () => {
    expect(trimGraph({ nodes: [], links: [], categories: [] }))
      .toEqual({ nodes: [], links: [], categories: [] })
  })
})

describe('trimPairedGraphs', () => {
  it('should return correct data', () => {
    const trimed = trimPairedGraphs([
      deriveInterfering(sample, BandEnum._5_GHz),
      deriveInterfering(sampleForSortingTest, BandEnum._5_GHz)
    ])
    expect(trimed[0].nodes.map(node => node.id).slice(1))
      .toEqual(trimed[1].nodes.map(node => node.id).slice(0, trimed[1].nodes.length - 1))
  })
})

describe('pairGraphs', () => {
  it('should return correct data', () => {
    const paired = pairGraphs([
      deriveInterfering({ ...sample, interferingLinks: null }, BandEnum._5_GHz),
      deriveInterfering(sampleForPairingTest, BandEnum._5_GHz)
    ])
    expect(paired[0].nodes
      .filter(node => node.category === 'highlight')
      .map(node => node.name))
      .toEqual(['name2', 'name3', 'name6', 'name8'])
    expect(paired[1].nodes
      .filter(node => node.category === 'highlight')
      .map(node => node.name))
      .toEqual(['name3', 'name6', 'name8'])
    expect(paired[0].nodes
      .filter(node => node.showTooltip)
      .map(node => node.name))
      .toEqual(['name2', 'name3', 'name6', 'name8'])
    expect(paired[1].nodes
      .filter(node => node.showTooltip)
      .map(node => node.name))
      .toEqual(['name2', 'name3', 'name6', 'name8'])
    expect(paired[1].nodes.map(node => node.value))
      .toEqual([...paired[0].nodes.map(node => node.value), [36]])
  })
})

describe('deriveTxPowerHighlight', () => {
  it('should return correct data', () => {
    const data = deriveTxPowerHighlight(
      pairGraphs(deriveInterferingGraphs(sampleGraphsForTxPower, BandEnum._5_GHz)))
    expect(data).toMatchSnapshot()
  })
  it('should handle empty', () => {
    const data = deriveTxPowerHighlight(
      pairGraphs(deriveInterferingGraphs([
        { nodes: [], links: [], interferingLinks: [] },
        sampleGraphsForTxPower[1]
      ], BandEnum._5_GHz)))
    expect(data).toMatchSnapshot()
  })
})

describe('getCrrmCsvData', () => {
  const $t = (params: MessageDescriptor) => (params.defaultMessage?.[0] as { value: string }).value
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

  it('returns correct state for equal nodes', () => {
    const graphs = [
      {
        nodes: gen.nodes([
          [1, [36], [80], ['_FULL']],
          [2, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([[1, 2]])
      },
      {
        nodes: gen.nodes([
          [1, [36], [40], ['_FULL']],
          [2, [52], [40], ['_3DB']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })

  it('returns correct state for nodes with TxPower = null', () => {
    const graphs = [
      {
        nodes: gen.nodes([
          [1, [36], [80], [null]],
          [2, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([[1, 2]])
      },
      {
        nodes: gen.nodes([
          [1, [36], [40], [null]],
          [2, [52], [40], [null]]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })

  it('returns correct state for AP missing in previous', () => {
    const graphs = [
      {
        type: 'previous',
        nodes: gen.nodes([
          [1, [36], [80], ['_FULL']],
          [2, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([[1, 2]])
      },
      {
        type: 'current',
        nodes: gen.nodes([
          [1, [36], [40], ['_FULL']],
          [2, [52], [40], ['_3DB']],
          [3, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2], [2, 3]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })

  it('returns correct state for AP missing in current', () => {
    const graphs = [
      {
        type: 'previous',
        nodes: gen.nodes([
          [1, [36], [80], ['_FULL']],
          [2, [36], [80], ['_FULL']],
          [3, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2], [2, 3]]),
        interferingLinks: gen.interferings([[1, 2], [2, 3]])
      },
      {
        type: 'current',
        nodes: gen.nodes([
          [1, [36], [40], ['_FULL']],
          [2, [52], [40], ['_3DB']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })

  it('returns correct state for APs missing in both previous & current', () => {
    const graphs = [
      {
        type: 'previous',
        nodes: gen.nodes([
          [1, [36], [80], ['_FULL']],
          [2, [36], [80], ['_FULL']],
          [4, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([[1, 2]])
      },
      {
        type: 'current',
        nodes: gen.nodes([
          [1, [36], [40], ['_FULL']],
          [2, [52], [40], ['_3DB']],
          [3, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2], [2, 3]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })

  it('returns correct value for Is Changed', () => {
    const graphs = [
      {
        nodes: gen.nodes([
          [1, [36], [80], ['_FULL']],
          [2, [36], [80], ['_FULL']],
          [3, [36], [80], ['_FULL']],
          [4, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([[1, 2]])
      },
      {
        nodes: gen.nodes([
          [1, [52], [80], ['_FULL']],
          [2, [36], [40], ['_FULL']],
          [3, [36], [80], ['_3DB']],
          [4, [36], [80], ['_FULL']]
        ]),
        links: gen.links([[1, 2]]),
        interferingLinks: gen.interferings([])
      }
    ] as unknown as ProcessedCloudRRMGraph[]
    expect(getCrrmCsvData(graphs, $t)).toMatchSnapshot()
  })
})

