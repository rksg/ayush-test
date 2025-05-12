import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo }                                           from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, renderHook, screen, waitFor, within }        from '@acx-ui/test-utils'

import { mockedEdges } from './__tests__/fixtures'

import { useEdgeActions, useIsEdgeFeatureReady, useIsEdgeReady } from '.'

const mockedDeleteApi = jest.fn()
const mockedSendOtpApi = jest.fn()
const mockedRebootApi = jest.fn()
const mockedShutdownApi = jest.fn()
const mockedResetApi = jest.fn()

describe('Edge enabled evaluation', () => {
  describe('useIsEdgeReady', () => {
    it('should return true', async () => {
      jest.mocked(useIsSplitOn).mockImplementationOnce(ff => ff === Features.EDGES_TOGGLE)
      const { result } = renderHook(() => useIsEdgeReady())
      expect(result.current).toBe(true)
    })

    it('should return false when edge toggle not ON', async () => {
      jest.mocked(useIsSplitOn).mockImplementationOnce(ff => ff === Features.EDGES_SD_LAN_HA_TOGGLE)
      const { result } = renderHook(() => useIsEdgeReady())
      expect(result.current).toBe(false)
    })
  })

  describe('useIsEdgeFeatureReady', () => {
    it('should return true', async () => {
      jest.mocked(useIsSplitOn)
        .mockImplementation(ff => ff === Features.EDGES_TOGGLE || ff === Features.EDGE_HA_TOGGLE)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE))
      expect(result.current).toBe(true)
    })

    it('should return false when edge toggle not ON', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_SD_LAN_HA_TOGGLE)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE))
      expect(result.current).toBe(false)
    })

    it('should return false when target flag not ON', async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGES_SD_LAN_HA_TOGGLE)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE))
      expect(result.current).toBe(false)
    })

    it('other feature flags should not considered PLM FF', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useIsTierAllowed).mockReturnValue(false)

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE))
      expect(result.current).toBe(true)
    })

    it('should return false when query with EDGE and EDGE-AV-REPORT feature is OFF', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff !== TierFeatures.EDGE_AV_REPORT)

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE))
      expect(result.current).toBe(false)
    })

    describe('edge PIN toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        jest.mocked(useIsTierAllowed).mockReturnValue(true)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when edge is not enabled', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockReturnValue(true)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockReturnValue(false)
        jest.mocked(useIsTierAllowed).mockReturnValue(true)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with PIN and EDGE-ADV feature is OFF', () => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
        jest.mocked(useIsTierAllowed).mockReturnValue(false)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('EDGE_PIN_ENHANCE_TOGGLE', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_PIN_ENHANCE_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE))
        expect(result.current).toBe(false)
      })

      // eslint-disable-next-line max-len
      it('should return false when query with EDGE_PIN_ENHANCE_TOGGLE and EDGE-ADV feature is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_PIN_ENHANCE_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.RBAC_IMPLICIT_P1)

        const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('edge NAT-T toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_NAT_T)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_NAT_T)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with NAT-T and featureID is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('Edge ARP Termination toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_ARPT_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ARPT)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ARPT)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with EDGE-ARPT and featureID is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_ARPT_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('edge mDNS-proxy toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_MDNS_PROXY_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_MDNS_PROXY)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_MDNS_PROXY)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with MDNS_PROXY and featureID is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_MDNS_PROXY_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('edge Multi-WAN toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_DUAL_WAN_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_MULTI_WAN)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_MULTI_WAN)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with MDNS_PROXY and featureID is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_DUAL_WAN_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
        expect(result.current).toBe(false)
      })
    })

    describe('edge HQoS toggle', () => {
      it('should return true when edge is enabled and feature flag is ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_QOS_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_HQOS)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
        expect(result.current).toBe(true)
      })

      it('should return false when boolean feature flag is not ready', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_HQOS)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
        expect(result.current).toBe(false)
      })

      it('should return false when query with HQoS and featureID is OFF', () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff === Features.EDGES_TOGGLE ||
          ff === Features.EDGE_QOS_TOGGLE)
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV)

        const { result } = renderHook(() =>
          useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
        expect(result.current).toBe(false)
      })
    })
  })
})

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
        EdgeUrlsInfo.shutdown.url,
        (req, res, ctx) => {
          mockedShutdownApi()
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

  afterEach(() => {
    jest.clearAllMocks()
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
    expect(dialog).toHaveTextContent('Rebooting the RUCKUS Edge will disconnect all connected clients. Are you sure you want to reboot?')
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

  it('should shutdown successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { shutdown } = result.current
    shutdown(mockedEdges[0], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Shutdown "Smart Edge 1"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Shutdown will safely end all operations on RUCKUS Edge. You will need to manually restart the device. Are you sure you want to shut down this RUCKUS Edge?')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Shutdown' }))
    await waitFor(() => {
      expect(mockedShutdownApi).toBeCalledTimes(1)
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
    expect(dialog).toHaveTextContent('Reset & Recover "Smart Edge 1"?Are you sure you want to reset and recover this RUCKUS Edge?Note: Reset & Recover can address anomalies, but may not resolve all issues, especially for complex, misconfigured, or hardware-related problems.CancelResetCancel')
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
    expect(dialog).toHaveTextContent('Are you sure you want to delete this RUCKUS Edge?')
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

  it('should delete two edges successfully', async () => {
    const mockedCallback = jest.fn()
    const { result } = renderHook(() => useEdgeActions(), {
      wrapper: ({ children }) => <Provider children={children} />
    })

    const { deleteEdges } = result.current
    deleteEdges([mockedEdges[3], mockedEdges[4]], mockedCallback)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Delete "2 RUCKUS Edges"?')
    // eslint-disable-next-line max-len
    expect(dialog).toHaveTextContent('Are you sure you want to delete these RUCKUS Edges?')
    await userEvent.type(within(dialog).getByRole('textbox'), 'Delete')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => {
      expect(mockedDeleteApi).toBeCalledTimes(2)
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