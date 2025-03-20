import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { pinApi }    from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CatchErrorDetails,
  EdgePinUrls,
  PersonalIdentityNetworkFormData,
  EdgePinFixtures
} from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, renderHook, waitFor } from '@acx-ui/test-utils'
import { RequestPayload }                  from '@acx-ui/types'

import { useEdgePinActions } from './useEdgePinActions'

const { mockPinData } = EdgePinFixtures

const mockedCallback = jest.fn()
const mockedUpdateReq = jest.fn()
const mockedActivateNetworkReq = jest.fn()
const mockedDeactivateNetworkReq = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useCreateEdgePinMutation: () => {
    return [(req: RequestPayload) => {
      return { unwrap: () => new Promise((resolve) => {
        resolve(true)
        setTimeout(() => {
          (req.callback as Function)({
            response: { id: 'mocked_service_id' }
          })
        }, 300)
      }) }
    }]
  }
}))

describe('useEdgePinActions', () => {
  beforeEach(() => {
    store.dispatch(pinApi.util.resetApiState())

    mockedCallback.mockClear()
    mockedUpdateReq.mockClear()
    mockedActivateNetworkReq.mockClear()
    mockedDeactivateNetworkReq.mockClear()

    mockServer.use(
      rest.put(
        EdgePinUrls.updateEdgePin.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgePinUrls.deactivateEdgePinNetwork.url,
        (req, res, ctx) => {
          mockedDeactivateNetworkReq(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgePinUrls.activateEdgePinNetwork.url,
        (req, res, ctx) => {
          mockedActivateNetworkReq(req.params)
          return res(ctx.status(202))
        }
      )
    )
  })
  describe('addPin', () => {
    const mockedAddData = mockPinData

    it('should add PIN successfully', async () => {
      const mockedData = {
        ...mockedAddData,
        networkIds: ['network_1', 'network_3']
      } as unknown as PersonalIdentityNetworkFormData

      const { result } = renderHook(() => useEdgePinActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { addPin } = result.current
      await addPin({
        payload: mockedData,
        callback: mockedCallback
      })

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))

      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_3'
      })
      expect(mockedActivateNetworkReq).toBeCalledWith({
        serviceId: 'mocked_service_id',
        wifiNetworkId: 'network_1'
      })
    })
  })

  describe('editPin', () => {
    const serviceId = mockPinData.id
    const mockedEditData = mockPinData as unknown as PersonalIdentityNetworkFormData
    mockedEditData.networkIds = mockedEditData.tunneledWlans.map(wlan => wlan.networkId)

    // eslint-disable-next-line max-len
    const prepareTesting = async (originData: PersonalIdentityNetworkFormData, submitData: PersonalIdentityNetworkFormData) => {
      const { result } = renderHook(() => useEdgePinActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { editPin } = result.current
      await editPin(originData, {
        payload: submitData,
        callback: mockedCallback
      })
    }

    it('should edit PIN successfully', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['network_4', 'network_5']
      }

      await prepareTesting(mockedData, mockedPayload)

      // should activate guest network
      expect(mockedActivateNetworkReq).toBeCalledTimes(2)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        serviceId,
        wifiNetworkId: 'network_5'
      })

      expect(mockedCallback).toBeCalledTimes(1)
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(2)
    })

    it('should skip update porfile when no change', async () => {
      const mockedData = cloneDeep(mockedEditData)
      const mockedPayload = {
        ...mockedData,
        networkIds: ['1', '2', 'network_3']
      }

      await prepareTesting(mockedData, mockedPayload)

      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(1)
      expect(mockedActivateNetworkReq).toBeCalledWith({
        serviceId,
        wifiNetworkId: 'network_3'
      })
      expect(mockedCallback).toBeCalledTimes(1)
    })

    it('should update porfile name', async () => {
      const mockedData = cloneDeep(mockedEditData)
      mockedData.name = 'newTestName'

      await prepareTesting(mockedEditData, mockedData)

      await waitFor(() => expect(mockedCallback).toBeCalledTimes(1))
      expect(mockedDeactivateNetworkReq).toBeCalledTimes(0)
      expect(mockedActivateNetworkReq).toBeCalledTimes(0)
    })

    it('should handle relation requests failed', async () => {
      const mockedReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgePinUrls.activateEdgePinNetwork.url,
          (req, res, ctx) => {
            mockedReq(req.params)
            return res(ctx.status(403), ctx.json({
              requestId: 'failed_req_id',
              errors: [{
                code: 'EDGE-00000',
                message: 'test failed'
              }]
            }))
          }
        ))

      const mockedCBFn = jest.fn()
      const mockedPayload = {
        ...mockedEditData,
        networkIds: ['network_1', 'network_3']
      }
      const { result } = renderHook(() => useEdgePinActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      const { editPin } = result.current
      let errResult
      try {
        await editPin(mockedEditData, {
          payload: mockedPayload,
          callback: mockedCBFn
        })
      } catch(err) {
        errResult = (err as CommonErrorsResult<CatchErrorDetails>).data.errors[0].code
      }

      expect(errResult).toBe('EDGE-00000')
      expect(mockedReq).toBeCalledWith({
        serviceId,
        wifiNetworkId: 'network_1'
      })
      expect(mockedCBFn).toBeCalledTimes(1)
      expect(mockedReq).toBeCalledWith({
        serviceId,
        wifiNetworkId: 'network_3'
      })
    })

    it('should handle profile update failed', async () => {
      const mockedCBFn = jest.fn()
      mockServer.use(
        rest.put(
          EdgePinUrls.updateEdgePin.url,
          (_req, res, ctx) => {
            return res(ctx.text('test rename failed'), ctx.status(500))
          }
        )
      )
      const { result } = renderHook(() => useEdgePinActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      const { editPin } = result.current
      let errResult
      try {
        await editPin(mockedEditData, {
          payload: {
            ...mockedEditData,
            name: 'testRename'
          },
          callback: mockedCBFn
        })
      } catch(err) {
        errResult = err
      }

      await waitFor(() => expect(mockedCBFn).toBeCalledTimes(1))
      expect(errResult.data).toBe('test rename failed')
    })
  })
})
