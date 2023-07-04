/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  waitFor,
  screen
} from '@acx-ui/test-utils'

import { fakePreference } from './fixtures'

import { usePreference } from '.'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/config', () => ({
  get: jest.fn().mockReturnValue('fake-google-maps-key')
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
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
      result.current.updatePartial({
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

  it('should be able to update when global not exist in first level', async () => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({
          edgeBeta: {
            'enabled': 'true',
            'Start Date': '2023-05-25 UTC'
          }
        }))
      )
    )

    const { result } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.getReqState.isLoading).toBe(false)
    })

    await act(async () => {
      result.current.updatePartial({
        newData: {
          global: { other: { field: 'test' } }
        }
      })
    })

    await waitFor(() => {
      expect(mockedUpdateReqFn).toBeCalledWith({
        edgeBeta: {
          'enabled': 'true',
          'Start Date': '2023-05-25 UTC'
        },
        global: { other: { field: 'test' } }
      })
    })
  })

  it('should popup confirm dialog', async () => {
    const { result, rerender } = renderHook(
      () => usePreference(),
      { wrapper: getWrapper(), route: { params } }
    )

    await waitFor(async () => {
      expect(result.current.currentMapRegion).toBe('TW')
    })

    await act(async () => {
      result.current.updatePartial({
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

    await screen.findByRole('dialog')
    await screen.findByText(/Are you sure you what to change Map Region/)
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedUpdateReqFn).toBeCalledWith({
        global: {
          mapRegion: 'GB'
        }
      })
    })
    await waitFor(() => {
      expect(mockedUsedNavigate).toBeCalledWith(0)
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
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
      result.current.updatePartial({
        newData: {
          global: { mapRegion: 'GB' }
        },
        onSuccess: mockedOnSuccessFn
      })
    })

    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedOnSuccessFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
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
      result.current.updatePartial({
        newData: { global: { mapRegion: 'GB' } },
        onError: mockedOnErrorFn
      })
    })

    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedOnErrorFn).toBeCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})

