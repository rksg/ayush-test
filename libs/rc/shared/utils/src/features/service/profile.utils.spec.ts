import { getDisabledActionMessage } from './profile.utils'

describe('profileUtils', () => {
  describe('getDisabledActionMessage', () => {

    it('should return undefined when no instances have applied fields', () => {
      const selectedRows = [
        { id: 1, name: 'Test 1', identityId: null },
        { id: 2, name: 'Test 2', identityId: undefined }
      ]
      const instances = [
        { fieldName: 'identityId' as const, fieldText: 'Identity' }
      ]
      const action = 'delete'

      const result = getDisabledActionMessage(selectedRows, instances, action)

      expect(result).toBeUndefined()
    })

    it('should return the correct message when instances have applied fields', () => {
      const selectedRows = [
        { id: 1, name: 'Test 1', identityId: '123' },
        { id: 2, name: 'Test 2', identityId: '456' }
      ]
      const instances = [
        { fieldName: 'identityId' as const, fieldText: 'Identity' }
      ]
      const action = 'delete'

      const result = getDisabledActionMessage(selectedRows, instances, action)

      expect(result).toBe('You are unable to delete these records due to its usage in Identity')
    })
  })
})
