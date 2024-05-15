import { rest } from 'msw'

import { EdgeDhcpSettingFormData, EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { act, mockServer, renderHook, waitFor }  from '@acx-ui/test-utils'

import { useEdgeDhcpActions } from './useEdgeDhcpActions'

const mockedConvertFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  convertEdgeDHCPFormDataToApiPayload: () => mockedConvertFn()
}))

const mockedCreateDhcpApi = jest.fn()
const mockedUpdateDhcpApi = jest.fn()
const mockedActivateDhcpApi = jest.fn()
const mockedDeactivateDhcpApi = jest.fn()
const mockedUpgradeDhcpApi = jest.fn()
const mockedRestartDhcpApi = jest.fn()

describe('useEdgeDhcpActions', () => {
  beforeEach(() => {
    mockedConvertFn.mockReset()
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.addDhcpService.url,
        (req, res, ctx) => {
          mockedCreateDhcpApi()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeDhcpUrls.updateDhcpService.url,
        (req, res, ctx) => {
          mockedUpdateDhcpApi()
          return res(ctx.status(202))
        }
      ),
      rest.put(
        EdgeDhcpUrls.activateDhcpService.url,
        (req, res, ctx) => {
          mockedActivateDhcpApi()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeDhcpUrls.deactivateDhcpService.url,
        (req, res, ctx) => {
          mockedDeactivateDhcpApi()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (req, res, ctx) => {
          mockedUpgradeDhcpApi()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeDhcpUrls.restartDhcpService.url,
        (req, res, ctx) => {
          mockedRestartDhcpApi()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createEdgeDhcpProfile, isEdgeDhcpProfileCreating } = result.current
    await act(async () => {
      await createEdgeDhcpProfile({} as EdgeDhcpSettingFormData)
    })
    await waitFor(() =>expect(isEdgeDhcpProfileCreating).toBeFalsy())
    await waitFor(() =>expect(mockedConvertFn).toBeCalledTimes(1))
    await waitFor(() =>expect(mockedCreateDhcpApi).toBeCalledTimes(1))
  })

  it('should update dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updateEdgeDhcpProfile } = result.current
    await act(async () => {
      await updateEdgeDhcpProfile('testId', {} as EdgeDhcpSettingFormData)
    })
    await waitFor(() =>expect(mockedConvertFn).toBeCalledTimes(1))
    await waitFor(() =>expect(mockedUpdateDhcpApi).toBeCalledTimes(1))
  })

  it('should activate dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { activateEdgeDhcp } = result.current
    await act(async () => {
      await activateEdgeDhcp('testId', 'venueId', 'edgeId')
    })
    await waitFor(() =>expect(mockedActivateDhcpApi).toBeCalledTimes(1))
  })

  it('should deactivate dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { deactivateEdgeDhcp } = result.current
    await act(async () => {
      await deactivateEdgeDhcp('testId', 'venueId', 'edgeId')
    })
    await waitFor(() =>expect(mockedDeactivateDhcpApi).toBeCalledTimes(1))
  })

  it('should upgrade dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { upgradeEdgeDhcp } = result.current
    await act(async () => {
      await upgradeEdgeDhcp('testId')
    })
    await waitFor(() =>expect(mockedUpgradeDhcpApi).toBeCalledTimes(1))
  })

  it('should restart dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { restartEdgeDhcp } = result.current
    await act(async () => {
      await restartEdgeDhcp('testId', 'venueId', 'edgeId')
    })
    await waitFor(() =>expect(mockedRestartDhcpApi).toBeCalledTimes(1))
  })
})