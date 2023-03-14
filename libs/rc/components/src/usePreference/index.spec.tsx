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

import { fakePreference } from './fixtures'

import { usePreference } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))

const mockedUpdateReqFn = jest.fn()
const getWrapper = () =>
  ({ children }: { children: React.ReactElement }) => (
    <Provider>
      {children}
    </Provider>
  )

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
        (_req, res, ctx) => {
          mockedUpdateReqFn(_req.body)
          return res(ctx.status(200))
        }
      )
    )
  })

  it('should be able to update deep field', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          global: {
            mapRegion: 'TW',
            other: {
              field: 'field1_val',
              field2: 'field2_val'
            }
          }
        }))
      )
    )

    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    await act(async () => {
      result.current.update({
        newData: {
          global: { other: { field: 'test' } }
        }
      })
    })

    await waitFor(() => {
      expect(mockedUpdateReqFn).toBeCalledWith({
        global: {
          mapRegion: 'TW',
          other: {
            field: 'test',
            field2: 'field2_val'
          }
        }
      })
    })
  })

  it('should update google map script correctly', async () => {
    const { result, rerender } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    await act(async () => {
      result.current.update({
        newData: {
          global: { mapRegion: 'GB' }
        }
      })
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
    await waitFor(() => {
      expect(scripts[0].src).toBe('https://maps.googleapis.com/maps/api/js?key=fake-google-maps-key&region=GB&libraries=places&language=en')//.toContain('&region=GB')
    })

    fireEvent.load(scripts[0])
    fireEvent.error(scripts[0])
  })

  it('should invoke on success when request succeed', async () => {
    const mockedOnSuccessFn = jest.fn()
    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    await act(async () => {
      result.current.update({
        newData: {
          global: { mapRegion: 'GB' }
        },
        onSuccess: mockedOnSuccessFn
      })
    })

    await waitFor(() => {
      expect(mockedOnSuccessFn).toHaveBeenCalled()
    })
  })

  it('should invoke on error when request failed', async () => {
    const mockedOnErrorFn = jest.fn()
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updatePreferences.url,
        (_req, res, ctx) => res(ctx.status(400))
      )
    )

    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    await act(async () => {
      result.current.update({
        newData: { global: { mapRegion: 'JR' } }
      })
    })

    expect(result.current.currentMapRegion).toBe('TW')
    await act(async () => {
      result.current.update({
        newData: { global: { mapRegion: 'GB' } },
        onError: mockedOnErrorFn
      })
    })

    await waitFor(() => {
      expect(mockedOnErrorFn).toBeCalled()
    })
  })
})

