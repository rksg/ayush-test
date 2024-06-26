import { flattenObject } from '.'

describe('dataUtils', () => {
  describe('flattenObject', () => {
    it('should flatten a nested object', () => {
      const nestedObject = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3
          }
        },
        f: 4
      }

      const expectedObject = {
        'a': 1,
        'b.c': 2,
        'b.d.e': 3,
        'f': 4
      }

      expect(flattenObject(nestedObject)).toEqual(expectedObject)
    })

    it('should handle empty objects', () => {
      expect(flattenObject({})).toEqual({})
    })

    it('should handle non-nested objects', () => {
      const nestedObject = { a: 1, b: 2, c: 3 }
      const expectedObject = { a: 1, b: 2, c: 3 }

      expect(flattenObject(nestedObject)).toEqual(expectedObject)
    })

    it('should handle objects with null values', () => {
      const nestedObject = {
        a: null,
        b: {
          c: null
        }
      }

      const expectedObject = {
        'a': null,
        'b.c': null
      }

      expect(flattenObject(nestedObject)).toEqual(expectedObject)
    })

    it('should handle objects with arrays', () => {
      const nestedObject = {
        a: [1, 2, 3],
        b: {
          c: [4, 5]
        }
      }

      const expectedObject = {
        'a': [1, 2, 3],
        'b.c': [4, 5]
      }

      expect(flattenObject(nestedObject)).toEqual(expectedObject)
    })
  })

})