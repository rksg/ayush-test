import {
  getIpSecIkeAlgorithmOptions,
  getIpSecEspAlgorithmOptions
} from './ipSecUtils'

describe('ipSecUtils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getIpSecIkeAlgorithmOptions', () => {
    it('should return the correct IKE algorithm options with translated labels', () => {
      const result = getIpSecIkeAlgorithmOptions()

      expect(result).toEqual([
        {
          value: 'AES128-SHA1-MODP2048',
          label: 'AE128-SHA1-MODP2048'
        },
        {
          value: 'AES256-SHA384-ECP384',
          label: 'AES256-SHA384-ECP384'
        }
      ])
    })
  })

  describe('getIpSecEspAlgorithmOptions', () => {
    it('should return the correct ESP algorithm options with translated labels', () => {
      const result = getIpSecEspAlgorithmOptions()

      expect(result).toEqual([
        {
          value: 'AES128-SHA1-MODP2048',
          label: 'AE128-SHA1-MODP2048'
        },
        {
          value: 'AES256-SHA384-ECP384',
          label: 'AES256-SHA384-ECP384'
        }
      ])

    })
  })
})