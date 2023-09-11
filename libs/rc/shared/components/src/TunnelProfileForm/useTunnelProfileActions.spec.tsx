import { rest } from 'msw'
import { act }  from 'react-dom/test-utils'

import { TunnelProfileUrls }               from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { useTunnelProfileActions } from './useTunnelProfileActions'

import { TunnelProfileFormType } from '.'

const mockedCreateTunnelApi = jest.fn()
const mockedUpdateTunnelApi = jest.fn()

describe('EdgeDhcpSettingForm', () => {
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

  it('should create dhcp successful', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createTunnelProfile, isTunnelProfileCreating } = result.current
    await act(async () => {
      await createTunnelProfile({} as TunnelProfileFormType)
    })
    await waitFor(() =>expect(isTunnelProfileCreating).toBeFalsy())
    await waitFor(() =>expect(mockedCreateTunnelApi).toBeCalledTimes(1))
  })

  it('should update dhcp successful', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updateTunnelProfile, isTunnelProfileUpdating } = result.current
    await act(async () => {
      await updateTunnelProfile('testId', {} as TunnelProfileFormType)
    })
    await waitFor(() =>expect(isTunnelProfileUpdating).toBeFalsy())
    await waitFor(() =>expect(mockedUpdateTunnelApi).toBeCalledTimes(1))
  })
})