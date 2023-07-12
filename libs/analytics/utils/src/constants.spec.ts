describe('constants', () => {
  describe('productNames', () => {
    const mockGet = jest.fn()
    beforeEach(() => {
      jest.resetModules()
      jest.doMock('@acx-ui/config', () => ({ get: mockGet }))
    })
    it('returns values for R1', () => {
      mockGet.mockReturnValue(undefined)
      expect(require('.').productNames).toEqual({ smartZone: 'RUCKUS One' })
    })
    it('returns values for RA', () => {
      mockGet.mockReturnValue('true')
      expect(require('.').productNames).toEqual({ smartZone: 'Smart Zone' })
    })
  })
})
