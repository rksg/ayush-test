import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                                          from '@acx-ui/feature-toggle'
import { edgeApi, edgeDhcpApi, edgeHqosProfilesApi }                                                                             from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeHqosProfileFixtures, EdgeHqosProfilesUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                                   from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData } from '../../../../Services/DHCP/Edge/__tests__/fixtures'

import { EdgeNetworkControl } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures
const { mockEdgeHqosProfileStatusList } = EdgeHqosProfileFixtures

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
  })
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
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

describe('Edge Cluster Network Control Tab', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[0]).not.toBeChecked()
    })
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[1]).toBeChecked()
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
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[0]).toBeChecked()
    })
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[1]).not.toBeChecked()
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
      expect(screen.getAllByRole('switch')[0]).toBeChecked()
    })
    await waitFor(() => {
      expect(screen.getAllByRole('switch')[1]).toBeChecked()
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
    expect(await screen.findByText('TestDHCP-1')).toBeVisible()
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
    expect(await screen.findByText('TestDHCP-1')).toBeVisible()
    await userEvent.selectOptions(await screen.findByRole('combobox'),
      await screen.findByRole('option', { name: 'TestDHCP-2' })
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
    expect(await screen.findByText('TestDHCP-1')).toBeVisible()
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
          currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    await screen.findAllByRole('button')
    expect(await screen.findByText('Test-QoS-1')).toBeVisible()
    const switchBtn = screen.getAllByRole('switch')[1]
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedDeactivateEdgeQosFn).toBeCalled()
  })

})
