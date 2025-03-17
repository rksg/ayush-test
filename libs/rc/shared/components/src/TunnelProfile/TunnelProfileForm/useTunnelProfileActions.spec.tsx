import { rest } from 'msw'

import { TunnelProfileFormType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                 from '@acx-ui/store'
import { act, mockServer, renderHook, waitFor }     from '@acx-ui/test-utils'

import { useTunnelProfileActions } from './useTunnelProfileActions'

const mockedCreateTunnelApi = jest.fn()
const mockedUpdateTunnelApi = jest.fn()

describe('useTunnelProfileActions', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        TunnelProfileUrls.createTunnelProfile.url,
        (req, res, ctx) => {
          mockedCreateTunnelApi()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        TunnelProfileUrls.updateTunnelProfile.url,
        (req, res, ctx) => {
          mockedUpdateTunnelApi()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create tunnel profile successful', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createTunnelProfileOperation, isTunnelProfileCreating } = result.current
    await act(async () => {
      await createTunnelProfileOperation({} as TunnelProfileFormType)
    })
    await waitFor(() =>expect(isTunnelProfileCreating).toBeFalsy())
    await waitFor(() =>expect(mockedCreateTunnelApi).toBeCalledTimes(1))
  })

  it('should update tunnel profile successful', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current
    await act(async () => {
      await updateTunnelProfileOperation('testId', {} as TunnelProfileFormType)
    })
    await waitFor(() =>expect(isTunnelProfileUpdating).toBeFalsy())
    await waitFor(() =>expect(mockedUpdateTunnelApi).toBeCalledTimes(1))
  })
})
