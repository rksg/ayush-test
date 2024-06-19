import { OverrideEntitiyType }     from './types'
import { transformOverrideValues } from './utils'

describe('Config Template Overrides utils', () => {
  describe('transformOverrideValues', () => {
    it('should transform flattened object into overrides array', () => {
      const entity = { a: 1, b: { c: 2 } } as OverrideEntitiyType
      const expectedOutput = {
        overrides: [{ a: 1 }, { 'b.c': 2 }]
      }

      const result = transformOverrideValues(entity)

      expect(result).toEqual(expectedOutput)
    })

    it('should handle empty entity', () => {
      const entity = {}
      const expectedOutput = { overrides: [] }

      const result = transformOverrideValues(entity)

      expect(result).toEqual(expectedOutput)
    })
  })
})
