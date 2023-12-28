import { truthy } from './truthy'

describe('truthy', () => {
  it('should filter out falsy values', () => {
    expect([
      true,
      false,
      'a',
      '',
      1,
      0,
      null,
      undefined
    ].filter(truthy)).toEqual([
      true,
      'a',
      1
    ])
  })
})
