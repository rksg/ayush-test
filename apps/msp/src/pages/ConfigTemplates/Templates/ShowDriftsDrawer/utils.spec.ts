import { TemplateInstanceDriftResponse } from '@acx-ui/rc/utils'

import { DriftComparisonSetData } from './DriftComparisonSet'
import {
  transformDriftResponse,
  convertDriftRecord,
  filterDriftRecord,
  convertDriftName
} from './utils'

describe('ShowDriftsDrawer utils', () => {
  describe('transformDriftResponse', () => {
    it('should transform the drift response into an array of DriftComparisonSetData', () => {
      const data: TemplateInstanceDriftResponse = {
        category1: {
          driftRecord1: { template: 'templateVal', instance: 'instanceVal' },
          driftRecord2: { template: 'templateVal2', instance: 'instanceVal2' }
        },
        category2: {
          driftRecord3: { template: 'templateVal3', instance: 'instanceVal3' }
        }
      }

      const expected: DriftComparisonSetData[] = [
        {
          category: 'category1',
          driftItems: [
            { name: 'driftRecord1', values: { template: 'templateVal', instance: 'instanceVal' } },
            { name: 'driftRecord2', values: { template: 'templateVal2', instance: 'instanceVal2' } }
          ]
        },
        {
          category: 'category2',
          driftItems: [
            { name: 'driftRecord3', values: { template: 'templateVal3', instance: 'instanceVal3' } }
          ]
        }
      ]

      expect(transformDriftResponse(data)).toEqual(expected)
    })

    it('should return an empty array if the input is empty', () => {
      expect(transformDriftResponse(undefined)).toEqual([])
    })
  })

  describe('convertDriftRecord', () => {
    it('should convert a drift record into an array of DriftComparisonData', () => {
      const record = {
        driftRecord1: { template: 'templateValue', instance: 'instanceValue' },
        driftRecord2: { template: 'templateValue2', instance: 'instanceValue2' }
      }

      const expected = [
        { name: 'driftRecord1', values: { template: 'templateValue', instance: 'instanceValue' } },
        { name: 'driftRecord2', values: { template: 'templateValue2', instance: 'instanceValue2' } }
      ]

      expect(convertDriftRecord(record)).toEqual(expected)
    })

    it('should return an empty array if the input is empty', () => {
      expect(convertDriftRecord({})).toEqual([])
    })
  })

  describe('filterDriftRecord', () => {
    it('should filter out drift records with names ending with "id" and uuid values', () => {
      const name = 'driftRecordId'
      const values = { template: '178d47bcae9540aba4bce725c6c47c8f', instance: '' }

      expect(filterDriftRecord(name, values)).toBe(false)
    })

    it('should not filter out drift records with names not ending with "id"', () => {
      const name = 'driftRecord'
      const values = { template: 'templateValue', instance: 'instanceValue' }

      expect(filterDriftRecord(name, values)).toBe(true)
    })

    it('should not filter out drift records with non-uuid values', () => {
      const name = 'driftRecordId'
      const values = { template: 'nonUuidValue', instance: 'nonUuidValue' }

      expect(filterDriftRecord(name, values)).toBe(true)
    })
  })

  describe('convertDriftName', () => {
    it('should convert drift names ending with "idname" to "/name"', () => {
      expect(convertDriftName('driftRecordIdname')).toBe('/name')
    })

    it('should not convert drift names not ending with "idname"', () => {
      expect(convertDriftName('driftRecord')).toBe('driftRecord')
    })
  })
})
