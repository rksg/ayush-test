import {
  render
} from '@acx-ui/test-utils'

import { getClientHealthClass, getDeviceTypeIcon, getOsTypeIcon } from '.'

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})


describe('Test getClientHealthClass function', () => {
  it('should return health class: good', async () => {
    expect(getClientHealthClass('Good'))
      .toBe('good')
  })
  it('should return health class: average', async () => {
    expect(getClientHealthClass('Average'))
      .toBe('average')
  })
  it('should return health class: poor', async () => {
    expect(getClientHealthClass('Poor'))
      .toBe('poor')
  })
  it('should return health class: default', async () => {
    expect(getClientHealthClass(''))
      .toBe('default')
  })
})

describe('Test getOsTypeIcon function', () => {
  it('should return os type icon', async () => {
    const { asFragment } = render(<>
      { getOsTypeIcon('apple') }
      { getOsTypeIcon('android') }
      { getOsTypeIcon('blackberry') }
      { getOsTypeIcon('chrome') }
      { getOsTypeIcon('linux') }
      { getOsTypeIcon('kindle') }
      { getOsTypeIcon('ubuntu') }
      { getOsTypeIcon('windows') }
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('Test getDeviceTypeIcon function', () => {
  it('should return device type icon', async () => {
    const { asFragment } = render(<>
      { getDeviceTypeIcon('laptop') }
      { getDeviceTypeIcon('smartphone') }
      { getDeviceTypeIcon('tablet') }
      { getDeviceTypeIcon('voip') }
      { getDeviceTypeIcon('gaming') }
      { getDeviceTypeIcon('printer') }
      { getDeviceTypeIcon('iot') }
      { getDeviceTypeIcon('wds') }
      { getDeviceTypeIcon('iot device') }
      { getDeviceTypeIcon('home av equipment') }
      { getDeviceTypeIcon('wds device') }
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})

