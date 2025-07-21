
import {
  computePastRange,
  transformLookupAndMappingData,
  transformToPropertyView,
  transformToLspView,
  transformVenuesData,
  TransformedMap,
  calcSLA,
  noDataCheck,
  customSort,
  ECList
} from './helpers'

import type { BrandVenuesSLA } from './services'

const mockMappingData = {
  data: [
    {
      id: '1', name: 'Name1', tenantType: 'Type1',
      integrator: 'Integrator1', integrators: ['Integrator1']
    },
    { id: '2', name: 'Name2', tenantType: 'Type2', integrators: [] }
  ]
}
const mockVenuesData = {
  data: [
    {
      tenantId: '1',
      incidentCount: 5,
      ssidComplianceSLA: [1, 2],
      onlineApsSLA: [3, 4],
      onlineSwitchesSLA: [1, 2],
      connectionSuccessSLA: [5, 6],
      timeToConnectSLA: [7, 8],
      clientThroughputSLA: [9, 10]
    },
    {
      tenantId: '1',
      incidentCount: 3,
      ssidComplianceSLA: [2, 3],
      onlineApsSLA: [4, 5],
      onlineSwitchesSLA: [3, 4],
      connectionSuccessSLA: [6, 7],
      timeToConnectSLA: [8, 9],
      clientThroughputSLA: [10, 11]
    },
    {
      tenantId: '1',
      incidentCount: null,
      ssidComplianceSLA: [null, null],
      onlineApsSLA: [null, null],
      onlineSwitchesSLA: [null, null],
      connectionSuccessSLA: [null, null],
      timeToConnectSLA: [null, null],
      clientThroughputSLA: [null, null]
    },
    {
      tenantId: '1',
      incidentCount: 0,
      ssidComplianceSLA: [0, 0],
      onlineApsSLA: [0, 0],
      onlineSwitchesSLA: [0, 0],
      connectionSuccessSLA: [0, 0],
      timeToConnectSLA: [0, 0],
      clientThroughputSLA: [0, 0]
    }
  ]
}
const mockLookupAndMappingData = {
  1: { name: 'Property1', integrators: ['2'], content: [mockMappingData.data[0]], type: 'MSP_REC' },
  2: { name: 'IntegratorName', content: [mockMappingData.data[1]] }
}

describe('helpers', () => {
  describe('transformToPropertyView', () => {
    it('should transform null correctly', () => {
      expect(transformToPropertyView([{
        avgConnSuccess: [null, null],
        avgClientThroughput: [null, null],
        avgTTC: [null, null],
        ssidCompliance: [null, null],
        lsps: []
      }])).toEqual([
        {
          avgClientThroughput: null,
          avgConnSuccess: null,
          avgTTC: null,
          guestExp: null,
          ssidCompliance: null,
          lsps: [],
          lsp: ''
        }
      ])
    })
  })

  describe('transformToLspView', () => {
    it('should return NaN when all properties have invalid data', () => {
      const properties = [
        {
          avgConnSuccess: [0, 0] as [number, number],
          avgClientThroughput: [0, 0] as [number, number],
          avgTTC: [0, 0] as [number, number],
          ssidCompliance: [0, 0] as [number, number],
          p1Incidents: NaN,
          deviceCount: NaN,
          property: 'Property1',
          tenantId: '1',
          lsps: ['LSP1'],
          hasValidData: false
        },
        {
          avgConnSuccess: [0, 0] as [number, number],
          avgClientThroughput: [0, 0] as [number, number],
          avgTTC: [0, 0] as [number, number],
          ssidCompliance: [0, 0] as [number, number],
          p1Incidents: NaN,
          deviceCount: NaN,
          property: 'Property2',
          tenantId: '2',
          lsps: ['LSP1'],
          hasValidData: false
        }
      ]

      const result = transformToLspView(properties, 'LSP')

      expect(result).toHaveLength(1)
      expect(result[0].p1Incidents).toBeNaN()
      expect(result[0].deviceCount).toBeNaN()
      expect(result[0].lsp).toBe('LSP1')
      expect(result[0].propertyCount).toBe(2)
    })

    it('should return cumulative sum when some properties have valid data', () => {
      const properties = [
        {
          avgConnSuccess: [10, 20] as [number, number],
          avgClientThroughput: [30, 40] as [number, number],
          avgTTC: [50, 60] as [number, number],
          ssidCompliance: [70, 80] as [number, number],
          p1Incidents: 5,
          deviceCount: 25,
          property: 'Property1',
          tenantId: '1',
          lsps: ['LSP1'],
          hasValidData: true
        },
        {
          avgConnSuccess: [0, 0] as [number, number],
          avgClientThroughput: [0, 0] as [number, number],
          avgTTC: [0, 0] as [number, number],
          ssidCompliance: [0, 0] as [number, number],
          p1Incidents: NaN,
          deviceCount: NaN,
          property: 'Property2',
          tenantId: '2',
          lsps: ['LSP1'],
          hasValidData: false
        },
        {
          avgConnSuccess: [15, 25] as [number, number],
          avgClientThroughput: [35, 45] as [number, number],
          avgTTC: [55, 65] as [number, number],
          ssidCompliance: [75, 85] as [number, number],
          p1Incidents: 3,
          deviceCount: 15,
          property: 'Property3',
          tenantId: '3',
          lsps: ['LSP1'],
          hasValidData: true
        }
      ]

      const result = transformToLspView(properties, 'LSP')

      expect(result).toHaveLength(1)
      expect(result[0].p1Incidents).toBe(8)
      expect(result[0].deviceCount).toBe(40)
      expect(result[0].lsp).toBe('LSP1')
      expect(result[0].propertyCount).toBe(3)
    })
  })
  describe('noDataCheck', () => {
    it('should return true when there is no data', () => {
      expect(noDataCheck(null)).toBe(true)
    })
  })
  describe('computePastRange', () => {
    it('should handle last8hours', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-12T08:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-11T16:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last24hours', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-13T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-11T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last7days', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2023-12-19T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-05T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle last30days', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2024-01-11T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-11-12T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle custom', () => {
      const startDate = '2023-12-10T00:00:00+00:00'
      const endDate = '2023-12-12T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-12-08T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
    it('should handle allTime', () => {
      const startDate = '2023-12-12T00:00:00+00:00'
      const endDate = '2024-03-12T00:00:00+00:00'
      const range = computePastRange(startDate, endDate)
      expect(range[0]).toMatch('2023-09-12T00:00:00+00:00')
      expect(range[1]).toMatch(startDate)
    })
  })
})


describe('transformLookupAndMappingData', () => {
  it('transforms mapping data correctly', () => {
    const data = {
      data: [
        {
          id: '1', name: 'Name1', tenantType: 'Type1',
          integrators: ['Integrator1'] // msp ec
        },
        {
          id: '2', name: 'Name2', tenantType: 'Type2',
          integrator: '2' // lsp
        },
        { id: '3', name: 'Name3', tenantType: 'Type3' } // from msp ec
      ]
    }
    const transformed = transformLookupAndMappingData(data as ECList)
    expect(transformed['1']).toEqual({
      name: 'Name1',
      type: 'Type1',
      integrators: ['Integrator1'],
      content: [data.data[0]]
    })
    expect(transformed['2']).toEqual({
      name: 'Name2',
      type: 'Type2',
      integrators: ['2'],
      content: [data.data[1]]
    })
    expect(transformed['3']).toEqual({
      name: 'Name3',
      type: 'Type3',
      integrators: [],
      content: [data.data[2]]
    })
  })
  it('handles empty data', () => {
    const transformed = transformLookupAndMappingData({ data: [] } as unknown as ECList)
    expect(transformed).toEqual({})
  })
})

describe('transformVenuesData', () => {

  it('transforms and sums venue data correctly', () => {
    const transformed = transformVenuesData(
      mockVenuesData as { data: BrandVenuesSLA[] },
      mockLookupAndMappingData as unknown as TransformedMap
    )
    expect(transformed).toEqual([
      {
        property: 'Property1',
        lsps: ['IntegratorName'],
        p1Incidents: 8,
        ssidCompliance: [3, 5],
        deviceCount: 15,
        avgConnSuccess: [11, 13],
        avgTTC: [15, 17],
        avgClientThroughput: [19, 21],
        id: 'Property1-0',
        tenantId: '1',
        hasValidData: true
      }
    ])
  })

  it('handles empty venue data', () => {
    const transformed = transformVenuesData(
      { data: [] },
      mockLookupAndMappingData as unknown as TransformedMap
    )
    expect(transformed).toEqual([
      {
        avgClientThroughput: '--',
        avgConnSuccess: '--',
        avgTTC: '--',
        deviceCount: NaN,
        lsps: ['IntegratorName'],
        p1Incidents: NaN,
        property: 'Property1',
        ssidCompliance: '--',
        id: 'Property1-0',
        tenantId: '1',
        hasValidData: false
      }])
  })

  it('handles undefined mapping data', () => {
    const transformed = transformVenuesData(mockVenuesData as { data: BrandVenuesSLA[] }, {})
    expect(transformed).toEqual([])
  })
  it('calcSLA should handle [0,0]', () => {
    expect(calcSLA([0,0])).toEqual(null)
  })
})

describe('customSort', () => {
  it('should sort numbers correctly', () => {
    const array = [3, 1, 2]
    const sortedArray = array.sort(customSort)
    expect(sortedArray).toEqual([1, 2, 3])
  })
  it('should handle multiple NaN values correctly', () => {
    const array = [NaN, 3, NaN, 1]
    const sortedArray = array.sort(customSort)
    expect(sortedArray).toEqual([NaN, NaN, 1, 3])
  })

  it('should handle an array with all NaN values', () => {
    const array = [NaN, NaN, NaN]
    const sortedArray = array.sort(customSort)
    expect(sortedArray).toEqual([NaN, NaN, NaN])
  })
})
