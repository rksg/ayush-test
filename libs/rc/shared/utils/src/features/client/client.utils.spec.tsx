import '@testing-library/jest-dom'
import { useIntl } from 'react-intl'

import {
  render,
  renderHook
} from '@acx-ui/test-utils'

import {
  getClientHealthClass,
  getDeviceTypeIcon,
  //eric_test getNoiseFloorStatus,
  getRssiStatus,
  getOsTypeIcon
} from '.'


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
      { getDeviceTypeIcon('ap') }
      { getDeviceTypeIcon('router') }
      { getDeviceTypeIcon('storage') }
      { getDeviceTypeIcon('pos') }
      { getDeviceTypeIcon('point of sale') }
      { getDeviceTypeIcon('other') }
      { getDeviceTypeIcon('') }
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})


describe('getRssiStatus', () => {
  it('Should take care of poor value correctly', async () => {
    expect(renderHook(() => getRssiStatus(useIntl(), -90)).result.current).toEqual({
      tooltip: 'Poor',
      color: '#ED1C24'
    })
  })
  it('Should take care of acceptable value correctly', async () => {
    expect(renderHook(() => getRssiStatus(useIntl(), -78)).result.current).toEqual({
      tooltip: 'Acceptable',
      color: '#F9C34B'
    })
  })
  it('Should take care of good value correctly', async () => {
    expect(renderHook(() => getRssiStatus(useIntl(), -30)).result.current).toEqual({
      tooltip: 'Good',
      color: '#23AB36'
    })
  })
  it('Should take care of empty value correctly', async () => {
    expect(renderHook(() => getRssiStatus(useIntl(), null)).result.current).toEqual({
      tooltip: '',
      color: ''
    })
  })
})

/*eric_text

describe('getNoiseFloorStatus', () => {
  it('Should take care of low value correctly', async () => {
    expect(renderHook(() => getNoiseFloorStatus(useIntl(), -80)).result.current).toEqual({
      tooltip: 'Low',
      color: '#23AB36'
    })
  })
  it('Should take care of high value correctly', async () => {
    expect(renderHook(() => getNoiseFloorStatus(useIntl(), -60)).result.current).toEqual({
      tooltip: 'High',
      color: '#ED1C24'
    })
  })
})
*/