import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                  from '@acx-ui/feature-toggle'
import { EdgeSdLanUrls, EdgeUrlsInfo, EdgeSdLanFixtures }  from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockedEdges } from './__tests__/fixtures'

import { checkSdLanScopedNetworkDeactivateAction, useEdgeActions, useSdLanScopedNetworkVenues, useSdLanScopedNetworks } from '.'

const { mockedSdLanDataList } = EdgeSdLanFixtures
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
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Reset & Recover "Smart Edge 1"?Are you sure you want to reset and recover this SmartEdge?Note: Reset & Recover can address anomalies, but may not resolve all issues, especially for complex, misconfigured, or hardware-related problems.CancelResetCancel')
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

describe('SD-LAN functions', () => {

  describe('useSdLanScopedNetworks', () => {
    const mockedSdLanGet = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedSdLanGet.mockClear()

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: mockedSdLanDataList }))
          }
        )
      )
    })

    it('should return networkId', async () => {
      const { result } = renderHook(() => useSdLanScopedNetworks(['mocked_network_1']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual(['8e22159cfe264ac18d591ea492fbc05a'])
      )
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      renderHook(() => useSdLanScopedNetworks(['mocked_network_1']), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(mockedSdLanGet).not.toBeCalled()
    })
  })

  describe('useSdLanScopedNetworkVenues', () => {
    const mockedSdLanGet = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      mockedSdLanGet.mockClear()

      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedSdLanGet()
            return res(ctx.json({ data: mockedSdLanDataList }))
          }
        )
      )
    })

    it('should return venueId', async () => {
      const { result } = renderHook(() => useSdLanScopedNetworkVenues('mocked_network_2'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      await waitFor(() =>
        expect(result.current)
          .toStrictEqual(['a307d7077410456f8f1a4fc41d861567', 'a8def420bd6c4f3e8b28114d6c78f237'])
      )
    })

    it('should do nothing when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      renderHook(() => useSdLanScopedNetworkVenues('mocked_network_2'), {
        wrapper: ({ children }) => <Provider children={children} />
      })

      expect(mockedSdLanGet).not.toBeCalled()
    })
  })

  describe('checkSdLanScopedNetworkDeactivateAction', () => {

    it('should poup confirm dialog when intersection is exactly 1', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1'], ['network_id_1'], mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('This network is running the SD-LAN')
      await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }))
      expect(mockedCallback).toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should poup confirm dialog when more than 1 intersectted', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1', 'network_id_2', 'network_id_3'],
        ['network_id_2', 'network_id_3'],
        mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('The SD-LAN service is running on one or some')
      await userEvent.click(await screen.findByRole('button', { name: 'Deactivate' }))
      expect(mockedCallback).toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('when click cancel, should do nothing and close dialog', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1'], ['network_id_1'], mockedCallback
      )

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('This network is running the SD-LAN')
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(mockedCallback).not.toBeCalled()
      await waitFor(() => expect(dialog).not.toBeVisible())
    })

    it('should no poup dialog when no intersectted', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        ['network_id_1', 'network_id_2', 'network_id_3'],
        ['network_id_5'],
        mockedCallback
      )

      expect(mockedCallback).toBeCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('should no poup dialog when the given data is invalid', async () => {
      const mockedCallback = jest.fn()
      checkSdLanScopedNetworkDeactivateAction(
        undefined,
        ['network_id_5'],
        mockedCallback
      )

      expect(mockedCallback).toBeCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})