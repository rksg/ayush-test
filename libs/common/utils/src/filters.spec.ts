import { generateDomainFilter } from "./filters"

describe('Filters', () => {
  it('should generate domain filter', () => {
    expect(generateDomainFilter('a')).toEqual([{ type: 'domain', name: 'a' }])
  })
})
