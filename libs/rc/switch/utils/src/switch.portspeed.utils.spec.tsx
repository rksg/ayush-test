import {
  getPortSpeedOptions
} from './switch.portspeed.utils'

describe('switch.portspeed.utils', () => {
  it('should compare switch versions', () => {
    expect(getPortSpeedOptions('ICX7150-C12P', '1/1/1', {})).toStrictEqual(
      [
        'NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE'
      ]
    )
    expect(getPortSpeedOptions('ICX7150-C12P', '1/3/5', {})).toStrictEqual(
      [
        'NONE', 'AUTO', 'TEN_M_FULL', 'TEN_M_HALF', 'ONE_HUNDRED_M_FULL', 'ONE_HUNDRED_M_HALF',
        'ONE_G_FULL', 'ONE_G_FULL_MASTER', 'ONE_G_FULL_SLAVE', 'TWO_POINT_FIVE_G_FULL',
        'TWO_POINT_FIVE_G_FULL_MASTER', 'TWO_POINT_FIVE_G_FULL_SLAVE', 'FIVE_G_FULL',
        'FIVE_G_FULL_MASTER', 'FIVE_G_FULL_SLAVE', 'TEN_G_FULL', 'TEN_G_FULL_MASTER',
        'TEN_G_FULL_SLAVE', 'TWENTY_FIVE_G_FULL', 'FORTY_G_FULL', 'ONE_HUNDRED_G_FULL', 'OPTIC'
      ]
    )
    expect(getPortSpeedOptions('ICX8200-24F', '1/1/2',
      { mediaType: 'MEDIA_TYPE_1000BASE_TX' })).toStrictEqual(
      ['NONE', 'ONE_G_FULL', 'ONE_HUNDRED_M_FULL']
    )
  })

})

