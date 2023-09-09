import { rest } from 'msw'

import { EdgeDhcpSettingFormData, EdgeDhcpUrls } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, renderHook, waitFor }       from '@acx-ui/test-utils'

import { useEdgeDhcpActions } from './useEdgeDhcpActions'

const mockedConvertFn = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  convertEdgeDHCPFormDataToApiPayload: () => mockedConvertFn()
}))

const mockedCreateDhcpApi = jest.fn()
const mockedUpdateDhcpApi = jest.fn()

describe('EdgeDhcpSettingForm', () => {
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
      )
    )
  })

  it('should create dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { createEdgeDhcpProfile, isEdgeDhcpProfileCreating } = result.current
    await createEdgeDhcpProfile({} as EdgeDhcpSettingFormData)
    await waitFor(() =>expect(isEdgeDhcpProfileCreating).toBeFalsy())
    await waitFor(() =>expect(mockedConvertFn).toBeCalledTimes(1))
    await waitFor(() =>expect(mockedCreateDhcpApi).toBeCalledTimes(1))
  })

  it('should update dhcp successful', async () => {
    const { result } = renderHook(() => useEdgeDhcpActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })
    const { updateEdgeDhcpProfile } = result.current
    await updateEdgeDhcpProfile('testId', {} as EdgeDhcpSettingFormData)
    await waitFor(() =>expect(mockedConvertFn).toBeCalledTimes(1))
    await waitFor(() =>expect(mockedUpdateDhcpApi).toBeCalledTimes(1))
  })
})