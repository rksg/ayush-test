import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { edgeApi }                                              from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeDhcpUrls, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                  from '@acx-ui/test-utils'

import { mockDhcpPoolStatsData, mockEdgeDhcpDataList } from '../../../../Services/DHCP/Edge/__tests__/fixtures'

import { EdgeClusterDhcp } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedUsedNavigate = jest.fn()
const mockedActivateEdgeDhcp = jest.fn()
const mockedDeactivateEdgeDhcp = jest.fn()

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

describe('Edge Cluster DHCP Tab', () => {
  let params: { tenantId: string, clusterId: string, activeTab?: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    store.dispatch(edgeApi.util.resetApiState())

    params = {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      clusterId: '1',
      activeTab: 'dhcp'
    }
    mockServer.use(
      rest.get(
        EdgeDhcpUrls.getDhcpList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeDhcpDataList))
      ),
      rest.patch(
        EdgeDhcpUrls.patchDhcpService.url,
        (_, res, ctx) => res(ctx.status(202))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpPoolStatsData))
      )
    )
  })

  it('toggle should be off when no pool returned', async () => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpPoolStats.url,
        (_, res, ctx) => res(ctx.json({
          data: []
        }))
      )
    )

    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('toggle should be ON when pools returned', async () => {
    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })


    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeChecked()
    })
    expect(await screen.findByRole('combobox')).toBeInTheDocument()
  })

  it('should show DHCP selection form when switch is toggled on', async () => {
    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
  })

  it('should back to list page when clicking cancel button', async () => {
    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toBeCalledWith({
      hash: '',
      pathname: `/${params.tenantId}/t/devices/edge`,
      search: ''
    })
  })

  it('should change cluster DHCP', async () => {
    mockedActivateEdgeDhcp.mockReturnValue(Promise.resolve())

    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
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

  it('should remove cluster DHCP when switch into off', async () => {
    mockedDeactivateEdgeDhcp.mockReturnValue(Promise.resolve())

    render(
      <Provider>
        <EdgeClusterDhcp currentClusterStatus={mockEdgeClusterList.data[0] as EdgeClusterStatus} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/cluster/:clusterId/edit/:activeTab'
        }
      })
    expect(await screen.findByText('TestDhcp-1')).toBeVisible()
    const switchBtn = screen.getByRole('switch')
    expect(switchBtn).toBeChecked()
    await userEvent.click(switchBtn)
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedDeactivateEdgeDhcp).toBeCalled()
  })
})
