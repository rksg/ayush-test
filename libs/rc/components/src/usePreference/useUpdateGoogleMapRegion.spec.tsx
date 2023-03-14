/* eslint-disable max-len */
import { useIsSplitOn }          from '@acx-ui/feature-toggle'
import { renderHook, fireEvent } from '@acx-ui/test-utils'

import { useUpdateGoogleMapRegion } from './useUpdateGoogleMapRegion'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))

describe('Map is not enabled', () => {
  beforeEach( () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  it('should not be able to update google map script', async () => {
    const { result } = renderHook(
      () => useUpdateGoogleMapRegion())

    result.current.update('GB')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts.length).toBe(0)
  })
})

describe('useUpdateGoogleMapRegion', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should update google map script correctly', async () => {
    const { result } = renderHook(
      () => useUpdateGoogleMapRegion())

    result.current.update('GB')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')
    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])
  })

  it('should ignore country code not exist in map', async () => {
    const { result } = renderHook(
      () => useUpdateGoogleMapRegion())

    result.current.update('GB')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')

    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])

    result.current.update('ABC')
    expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')

    result.current.update('')
    expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')
  })
})