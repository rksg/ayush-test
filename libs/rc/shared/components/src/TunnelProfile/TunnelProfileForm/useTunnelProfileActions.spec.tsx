import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider }                 from 'react-redux'

import { MtuTypeEnum, NetworkSegmentTypeEnum, TunnelProfileFormType } from '@acx-ui/rc/utils'
import { store }                                                      from '@acx-ui/store'
import { RequestPayload }                                             from '@acx-ui/types'

import { useTunnelProfileActions } from './useTunnelProfileActions'

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useCreateTunnelProfileMutation: jest.fn()
}))

const mockedAddFn = jest.fn()
const mockedUpdateFn = jest.fn()


jest.mock('@acx-ui/rc/services', () => {
  const originalModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...originalModule,
    useCreateTunnelProfileMutation: () => {
      let isCreating = false

      return [
        (req: RequestPayload) => {
          isCreating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedAddFn(req.payload)
              resolve(true)
              setTimeout(() => {
                isCreating = false;
                (req.callback as Function)({
                  response: { id: 'mock_tunnel_id' }
                })
              }, 300)
            })
          }
        },
        { isLoading: isCreating }
      ]
    },
    useUpdateTunnelProfileMutation: () => {
      let isUpdating = false

      return [
        (req: RequestPayload) => {
          isUpdating = true
          return {
            unwrap: () => new Promise((resolve) => {
              mockedUpdateFn(req.payload)
              resolve(true)
              setTimeout(() => {
                isUpdating = false;
                (req.callback as Function)({
                  response: { id: 'mock_tunnel_id' }
                })
              }, 300)
            })
          }
        },
        { isLoading: isUpdating }
      ]
    }
  }
})


describe('useTunnelProfileActions', () => {
  const mockData: TunnelProfileFormType = {
    id: 'mock_tunnel_id',
    name: 'testTunnel',
    tags: '',
    mtuType: MtuTypeEnum.AUTO,
    forceFragmentation: false,
    ageTimeMinutes: 0,
    type: NetworkSegmentTypeEnum.VXLAN
  }

  it('should render useTunnelProfileActions without errors', () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    expect(result.current).toBeDefined()
    expect(result.current.createTunnelProfileOperation).toBeDefined()
    expect(result.current.updateTunnelProfileOperation).toBeDefined()
  })

  it('should call createTunnelProfile with correct payload and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { createTunnelProfileOperation, isTunnelProfileCreating } = result.current
    await act(async () => {
      await createTunnelProfileOperation(mockData)
    })

    await waitFor(() => {
      expect(mockedAddFn).toHaveBeenCalledWith(mockData)
    })

    await waitFor(() =>expect(isTunnelProfileCreating).toBeFalsy())
  })

  it('should call updateTunnelProfile with correct payload and handle callback', async () => {
    const { result } = renderHook(() => useTunnelProfileActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
    })

    const { updateTunnelProfileOperation, isTunnelProfileUpdating } = result.current
    await act(async () => {
      await updateTunnelProfileOperation('mock_tunnel_id', mockData)
    })

    await waitFor(() => {
      expect(mockedUpdateFn).toHaveBeenCalledWith(mockData)
    })

    await waitFor(() =>expect(isTunnelProfileUpdating).toBeFalsy())
  })

})