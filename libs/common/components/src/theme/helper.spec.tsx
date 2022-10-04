const helper = jest.requireActual('./helper')

describe('theme helper', () => {
  it('returns css string', () => {
    expect(helper.cssStr('visibility')).toEqual('visible')
  })

  it('returns css number', () => {
    // only property available in test is visibility: 'visible'
    expect(helper.cssNumber('visibility')).toEqual(NaN)
  })
})
