import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { Features }                                  from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                     from '@acx-ui/rc/components'
import { edgeApi, edgeDhcpApi, edgeHqosProfilesApi } from '@acx-ui/rc/services'
import {
  EdgeClusterStatus,
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeGeneralFixtures,
  EdgeHqosProfileFixtures,
  EdgeHqosProfilesUrls,
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  EdgePinFixtures,
  EdgeUrlsInfo,
  EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData } from '../../../../Services/DHCP/Edge/__tests__/fixtures'

import { EdgeNetworkControl } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures
const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const { mockPinStatsList } = EdgePinFixtures

const mockedUsedNavigate = jest.fn()
const mockedActivateEdgeDhcp = jest.fn()
const mockedDeactivateEdgeDhcp = jest.fn()
const mockedActivateEdgeQosFn = jest.fn()
const mockedDeactivateEdgeQosFn = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useEdgeDhcpActions: () => ({
    activateEdgeDhcp: mockedActivateEdgeDhcp,
    deactivateEdgeDhcp: mockedDeactivateEdgeDhcp
  }),
  ApCompatibilityToolTip: () => <div data-testid='ApCompatibilityToolTip' />,
  EdgeCompatibilityDrawer: () => <div data-testid='EdgeCompatibilityDrawer' />,
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={''}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeFeatureSetsQuery: jest.fn(() => ({
    arpRequiredFw: '2.3.0'
  })),
  useGetVenueEdgeFirmwareListQuery: jest.fn(() => ({
    venueEdgeFw: '2.3.0.200'
  }))
}))

describe('Edge Cluster Network Control Tab', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }
  const mockEdgeClusterListForHqos = _.cloneDeep(mockEdgeClusterList.data[0])
  mockEdgeClusterListForHqos.edgeList.forEach(e => e.cpuCores = 4)
  beforeEach(() => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff !== Features.EDGE_MDNS_PROXY_TOGGLE
        && ff !== Features.EDGE_ARPT_TOGGLE
        && ff !== Features.EDGE_PIN_HA_TOGGLE)

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeDhcpApi.util.resetApiState())
    store.dispatch(edgeHqosProfilesApi.util.resetApiState())

    params = {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '1',
      activeTab: 'networkControl'
    }
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList))
      ),
      rest.put(
        EdgeHqosProfilesUrls.activateEdgeCluster.url,
        (req, res, ctx) => {
          mockedActivateEdgeQosFn(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeHqosProfilesUrls.deactivateEdgeCluster.url,
        (req, res, ctx) => {
          mockedDeactivateEdgeQosFn(req.params)
          return res(ctx.status(202))
        }
      ),
      rest.get(
        EdgeHqosProfilesUrls.getEdgeHqosProfileById.url,
        (req, res, ctx) => res(ctx.json(mockEdgeHqosProfileStatusList.data[1]))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      )
    )
  })

  it('dhcp toggle should be off when no dhcp returned', async () => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )

    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })

    const switchBtns = await screen.findAllByRole('switch')
    await waitFor(() => {
      expect(getDhcpSwitchBtn(switchBtns)).not.toBeChecked()
    })
    await waitFor(() => {
      expect(getHqosSwitchBtn(switchBtns)).toBeChecked()
    })

  })

  it('HQoS toggle should be off when no HQoS returned', async () => {
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )

    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    const switchBtns = await screen.findAllByRole('switch')
    await waitFor(() => {
      expect(getDhcpSwitchBtn(switchBtns)).toBeChecked()
    })
    await waitFor(() => {
      expect(getHqosSwitchBtn(switchBtns)).not.toBeChecked()
    })

  })

  it('dhcp toggle should be on when dhcp returned', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })


    await waitFor(() => {
      expect(getDhcpSwitchBtn()).toBeChecked()
    })
    const comboboxArray = await screen.findAllByRole('combobox')
    expect(comboboxArray[0]).toBeInTheDocument()
    expect(comboboxArray[1]).toBeInTheDocument()
  })

  it('should show DHCP and HQoS selection form when switch is toggled on', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
    expect(await screen.findByText('Test-QoS-1')).toBeVisible()
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    })
  })

  it('should change cluster DHCP', async () => {
    mockedActivateEdgeDhcp.mockReturnValue(Promise.resolve())
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'TestDhcp-2' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedActivateEdgeDhcp).toBeCalledWith(
      '2',
      mockEdgeClusterList.data[0]?.venueId,
      params.clusterId
    )
  })

  it('should change cluster HQoS', async () => {
    mockedActivateEdgeQosFn.mockReturnValue(Promise.resolve())
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    await screen.findAllByRole('button')
    expect(await screen.findByText('Test-QoS-1')).toBeVisible()
    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'Test-QoS-2' })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedActivateEdgeQosFn).toBeCalledWith({
      edgeClusterId: params.clusterId,
      policyId: mockEdgeHqosProfileStatusList.data[1].id,
      venueId: mockEdgeClusterList.data[0]?.venueId }
    )
  })

  it('should remove cluster DHCP when switch into off', async () => {
    mockedDeactivateEdgeDhcp.mockReturnValue(Promise.resolve())
    mockServer.use(
      rest.post(
        EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
    const switchBtn = screen.getAllByRole('switch')[0]
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedDeactivateEdgeDhcp).toBeCalled()
  })

  it('should remove cluster HQoS when switch into off', async () => {
    mockedDeactivateEdgeQosFn.mockReturnValue(Promise.resolve())
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterListForHqos as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })

    expect(await screen.findByText('Hierarchical QoS')).toBeVisible()
    const switchBtn = await screen.findAllByRole('switch')
    expect(switchBtn[1]).not.toBeDisabled()
    expect(await screen.findByText('Test-QoS-1')).toBeVisible()
    expect(switchBtn[1]).toBeChecked()
    await userEvent.click(switchBtn[1])
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedDeactivateEdgeQosFn).toBeCalled()

  })

  it('should disabed HQoS swtich button', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Hierarchical QoS')).toBeVisible()
    const switchBtn = await screen.findAllByRole('switch')
    expect(switchBtn[1]).toBeDisabled()
  })

  it('should enabled HQoS swtich button', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterListForHqos as EdgeClusterStatus} />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Hierarchical QoS')).toBeVisible()
    const switchBtn = await screen.findAllByRole('switch')
    expect(switchBtn[1]).not.toBeDisabled()
  })

  it('should show compatibility component', async () => {
    render(
      <Provider>
        <EdgeNetworkControl
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(2)
    expect(toolTips[0]).toBeVisible()
    expect(toolTips[1]).toBeVisible()
    expect(await screen.findByTestId('EdgeCompatibilityDrawer')).toBeVisible()
  })

  describe('DHCP and Pin FF enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_DHCP_HA_TOGGLE
          || ff === Features.EDGE_PIN_HA_TOGGLE)

      mockServer.use(
        rest.post(
          EdgeDhcpUrls.getDhcpStats.url,
          (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
        ),
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_req, res, ctx) => res(ctx.json(mockPinStatsList))
        ))
    })

    it('should greyout DHCP dropdown when Pin is using', async () => {
      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      const dhcpSelector = await screen.findByRole('combobox')
      expect(await screen.findByText('TestDhcp-1')).toBeVisible()
      await waitFor(() => expect(dhcpSelector).toBeDisabled())
      expect(getDhcpSwitchBtn()).toBeDisabled()
    })
  })

  describe('mDNS', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_MDNS_PROXY_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

      params = {
        tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
        clusterId: mockEdgeClusterList.data[0].clusterId,
        activeTab: 'networkControl'
      }

      mockServer.use(
        rest.post(
          EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
          (_, res, ctx) => res(ctx.json({
            data: mockEdgeMdnsViewDataList
          }))
        ))
    })

    it('should change cluster mDNS', async () => {
      const mockedActivateEdgeClusterReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
          (req, res, ctx) => {
            mockedActivateEdgeClusterReq(req.params)
            return res(ctx.status(202))
          }
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      await screen.findByText('mDNS Proxy')
      const mdnsSwitch = getMdnsSwitchBtn()
      await waitFor(() => expect(mdnsSwitch).toBeChecked())
      const dropdown = getMdnsDropdownBtn()
      await waitFor(() => expect(dropdown).toHaveValue(mockEdgeMdnsViewDataList[0].id))
      await userEvent.selectOptions(
        dropdown!,
        await screen.findByRole('option', { name: mockEdgeMdnsViewDataList[1].name })
      )

      await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockedActivateEdgeClusterReq).toBeCalledWith({
        venueId: mockEdgeClusterList.data[0].venueId,
        serviceId: mockEdgeMdnsViewDataList[1].id,
        edgeClusterId: mockEdgeClusterList.data[0].clusterId
      })
    })

    it('should deactivate cluster mDNS when switch into off', async () => {
      const mockedDeactivateEdgeClusterReq = jest.fn()
      mockServer.use(
        rest.delete(
          EdgeMdnsProxyUrls.deactivateEdgeMdnsProxyCluster.url,
          (req, res, ctx) => {
            mockedDeactivateEdgeClusterReq(req.params)
            return res(ctx.status(202))
          }
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      expect(await screen.findByText(mockEdgeMdnsViewDataList[0].name)).toBeVisible()
      const mdnsSwitch = getMdnsSwitchBtn()
      expect(mdnsSwitch).toBeChecked()
      await userEvent.click(mdnsSwitch!)
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockedDeactivateEdgeClusterReq).toBeCalledWith({
        venueId: mockEdgeClusterList.data[0].venueId,
        serviceId: mockEdgeMdnsViewDataList[0].id,
        edgeClusterId: mockEdgeClusterList.data[0].clusterId
      })
    })

    it('should not trigger API when there is no change', async () => {
      const mockedActivateEdgeClusterReq = jest.fn()
      mockServer.use(
        rest.put(
          EdgeMdnsProxyUrls.activateEdgeMdnsProxyCluster.url,
          (req, res, ctx) => {
            mockedActivateEdgeClusterReq(req.params)
            return res(ctx.status(202))
          }
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      await screen.findByText('mDNS Proxy')
      const mdnsSwitch = getMdnsSwitchBtn()
      await waitFor(() => expect(mdnsSwitch).toBeChecked())
      const dropdown = getMdnsDropdownBtn()
      await waitFor(() => expect(dropdown).toHaveValue(mockEdgeMdnsViewDataList[0].id))

      await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockedActivateEdgeClusterReq).toBeCalledTimes(0)
    })

    it('should show compatibility component', async () => {
      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })
      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      expect(await screen.findByTestId('EdgeCompatibilityDrawer')).toBeVisible()
    })
  })

  describe('ARP Termination', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_ARPT_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

      params = {
        tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
        clusterId: mockEdgeClusterList.data[0].clusterId,
        activeTab: 'networkControl'
      }
    })

    it('should change cluster ARP Termination settings', async () => {
      const mockedUpddateArpTerminationSettingsReq = jest.fn()
      const mockedGetArpTerminationSettingsReq = jest.fn()
      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getEdgeClusterArpTerminationSettings.url,
          (req, res, ctx) => {
            mockedGetArpTerminationSettingsReq()
            return res(ctx.json({
              enabled: true,
              agingTimerEnabled: true,
              agingTimeSec: 600
            }))}
        ),
        rest.put(
          EdgeUrlsInfo.updateEdgeClusterArpTerminationSettings.url,
          (req, res, ctx) => {
            mockedUpddateArpTerminationSettingsReq(req.body)
            return res(ctx.status(202))
          }
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      await screen.findByText('ARP Termination')
      const arpSwitch = getArpSwitchBtn()
      await waitFor(() => expect(mockedGetArpTerminationSettingsReq).toBeCalled())
      await waitFor(() => expect(arpSwitch).toBeChecked())
      const arpAgingSwitch = getArpAgingSwitchBtn()
      await waitFor(() => expect(arpAgingSwitch).toBeChecked())
      const arpAgingTimer = getArpAgingTimerSpinBtn()
      await waitFor(() => expect(arpAgingTimer).toHaveValue('600'))

      await userEvent.click(arpAgingSwitch!)
      await waitFor(() => expect(arpAgingTimer).not.toBeVisible())
      await userEvent.click(arpSwitch!)
      await waitFor(() => expect(arpAgingSwitch).not.toBeVisible())

      await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockedUpddateArpTerminationSettingsReq).toBeCalledWith({
        enabled: false,
        agingTimerEnabled: true,
        agingTimeSec: 600
      })
    })

    it('should not trigger API when there is no change', async () => {
      const mockedUpddateArpTerminationSettingsReq = jest.fn()
      const mockedGetArpTerminationSettingsReq = jest.fn()
      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getEdgeClusterArpTerminationSettings.url,
          (req, res, ctx) => {
            mockedGetArpTerminationSettingsReq()
            return res(ctx.json({
              enabled: true,
              agingTimerEnabled: true,
              agingTimeSec: 600
            }))}
        ),
        rest.put(
          EdgeUrlsInfo.updateEdgeClusterArpTerminationSettings.url,
          (req, res, ctx) => {
            mockedUpddateArpTerminationSettingsReq(req.params)
            return res(ctx.status(202))
          }
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      await screen.findByText('ARP Termination')
      const arpSwitch = getArpSwitchBtn()
      await waitFor(() => expect(mockedGetArpTerminationSettingsReq).toBeCalled())
      await waitFor(() => expect(arpSwitch).toBeChecked())
      const arpAgingSwitch = getArpAgingSwitchBtn()
      await waitFor(() => expect(arpAgingSwitch).toBeChecked())
      const arpAgingTimer = getArpAgingTimerSpinBtn()
      await waitFor(() => expect(arpAgingTimer).toHaveValue('600'))

      await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(mockedUpddateArpTerminationSettingsReq).toBeCalledTimes(0)
    })

    it('should show compatibility component', async () => {
      const mockedGetArpTerminationSettingsReq = jest.fn()
      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getEdgeClusterArpTerminationSettings.url,
          (req, res, ctx) => {
            mockedGetArpTerminationSettingsReq()
            return res(ctx.json({
              enabled: true,
              agingTimerEnabled: true,
              agingTimeSec: 600
            }))}
        )
      )

      render(
        <Provider>
          <EdgeNetworkControl
            currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
          }
        })

      await screen.findByText('ARP Termination')
      await waitFor(() => expect(mockedGetArpTerminationSettingsReq).toBeCalled())
      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      expect(await screen.findByTestId('EdgeCompatibilityDrawer')).toBeVisible()
    })
  })

})

const getDhcpSwitchBtn = (givenSwitchBtns?: HTMLElement[]) => {
  if (givenSwitchBtns) {
    return givenSwitchBtns.find(btn => btn.id === 'dhcpSwitch')
  }

  const switchBtn = screen.getAllByRole('switch')
  return switchBtn.find(btn => btn.id === 'dhcpSwitch')
}

const getHqosSwitchBtn = (givenSwitchBtns?: HTMLElement[]) => {
  if (givenSwitchBtns) {
    return givenSwitchBtns.find(btn => btn.id === 'hqosSwitch')
  }

  const switchBtn = screen.getAllByRole('switch')
  return switchBtn.find(btn => btn.id === 'hqosSwitch')
}

const getMdnsSwitchBtn = () => {
  const switchBtn = screen.getAllByRole('switch')
  const mdnsSwitch = switchBtn.find(btn => btn.id === 'edgeMdnsSwitch')
  return mdnsSwitch
}

const getMdnsDropdownBtn = () => {
  const comboboxs = screen.getAllByRole('combobox')
  const mdnsCombobox = comboboxs.find(btn => btn.id === 'edgeMdnsId')
  return mdnsCombobox
}

const getArpSwitchBtn = () => {
  const switchBtn = screen.getAllByRole('switch')
  const aprSwitch = switchBtn.find(btn => btn.id === 'arpTerminationSwitch')
  return aprSwitch
}

const getArpAgingSwitchBtn = () => {
  const switchBtn = screen.getAllByRole('switch')
  const aprAgingSwitch = switchBtn.find(btn => btn.id === 'arpAgingTimerSwitch')
  return aprAgingSwitch
}

const getArpAgingTimerSpinBtn = () => {
  const spinBtn = screen.getAllByRole('spinbutton').find(btn => btn.id === 'agingTimeSec')
  return spinBtn
}