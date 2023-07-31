import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }                                    from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockedEdges } from './__tests__/fixtures'

import { useEdgeActions } from '.'

const mockedDeleteApi = jest.fn()
const mockedBuckDeleteApi = jest.fn()
const mockedSendOtpApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedResetApi = jest.fn()

describe('useEdgeActions', () => {

  beforeEach(() => {
    mockServer.use(
      rest.delete(
        EdgeUrlsInfo.deleteEdge.url,
        (req, res, ctx) => {
          mockedDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeUrlsInfo.deleteEdges.url,
        (req, res, ctx) => {
          mockedBuckDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.patch(
        EdgeUrlsInfo.sendOtp.url,
        (req, res, ctx) => {
          mockedSendOtpApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.reboot.url,
        (req, res, ctx) => {
          mockedRebootApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeUrlsInfo.factoryReset.url,
        (req, res, ctx) => {
          mockedResetApi()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should reboot successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { reboot } = result.current
    reboot(mockedEdges[0], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Reboot "Smart Edge 1"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Rebooting the SmartEdge will disconnect all connected clients. Are you sure you want to reboot?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reboot' }))
    await waitFor(() => {
      expect(mockedRebootApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should reset successfully', async () => {
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { factoryReset } = result.current
    factoryReset(mockedEdges[0])
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Reset and recover "Smart Edge 1"?')
    expect(dialog).toHaveTextContent('Are you sure you want to reset and recover this SmartEdge?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reset' }))
    await waitFor(() => {
      expect(mockedResetApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should delete successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteEdges } = result.current
    deleteEdges([mockedEdges[0]], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Delete "Smart Edge 1"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Are you sure you want to delete this SmartEdge?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should buck delete successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteEdges } = result.current
    deleteEdges([mockedEdges[3], mockedEdges[4]], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Delete "2 SmartEdges"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Are you sure you want to delete these SmartEdges?')
    await userEvent.type(within(dialog).getByRole('textbox'), 'Delete')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedBuckDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should send OTP successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { sendOtp } = result.current
    sendOtp(mockedEdges[0], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Send OTP')
    expect(dialog).toHaveTextContent('Are you sure you want to send OTP?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(mockedSendOtpApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(mockedCallback).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
