/* eslint-disable max-len */
import { rest } from 'msw'
import { act }  from 'react-dom/test-utils'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

import { fakePreference } from '../__tests__/fixtures'

import { usePreference } from './usePreference'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))

const getWrapper = () =>
  ({ children }: { children: React.ReactElement }) => (
    <Provider>
      {children}
    </Provider>
  )

describe('Map is not enabled', () => {
  beforeEach( () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json(fakePreference))
      )
    )
  })

  it('should not load google map script', async () => {
    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.getReqState.isLoading).toEqual(false)
    })

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts.length).toBe(0)
  })

  it('should not be able to update google map script', async () => {
    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.getReqState.isLoading).toEqual(false)
    })

    result.current.updateGoogleMapRegion('')

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    expect(scripts.length).toBe(0)
  })
})

describe('usePreference', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json(fakePreference))
      ),
      rest.put(
        AdministrationUrlsInfo.updatePreferences.url,
        (_req, res, ctx) => res(ctx.status(200))
      )
    )
  })

  it('should update google map script correctly', async () => {
    const { result, rerender } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    const payload = {
      global: { mapRegion: 'GB' }
    }
    await act(async () => {
      result.current.update({ params, payload })
    })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: { mapRegion: 'GB' } }))
      )
    )

    rerender()

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const scripts = document.getElementsByTagName('script')
    await waitFor(async () => {
      expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')
    })

    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])
  })
})