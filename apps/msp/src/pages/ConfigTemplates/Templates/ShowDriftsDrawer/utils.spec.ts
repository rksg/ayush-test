import {
  filterDriftRecord,
  convertDriftName
} from './utils'

describe('ShowDriftsDrawer utils', () => {
  describe('filterDriftRecord', () => {
    it('should filter out drift records with names ending with "id" and uuid values', () => {
      const name = 'driftRecordId'
      const values = { template: '178d47bcae9540aba4bce725c6c47c8f', instance: null }

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
