import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                    from '@acx-ui/feature-toggle'
import { EdgeLagFixtures, EdgePortConfigFixtures, EdgeSubInterfaceFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { EdgeSubInterfacesTab } from '.'

const { edgePortsSetting } = EdgePortConfigFixtures
const { mockEdgeSubInterfacesStatus, mockEdgeLagSubInterfacesStatus } = EdgeSubInterfaceFixtures
const { mockEdgeLagStatusList } = EdgeLagFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge overview sub-interfaces tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'tenant-id', serialNumber: 'edge-serialnum' }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeSubInterfacesStatusList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgeSubInterfacesStatus)
          )
        }
      ),
      rest.post(
        EdgeUrlsInfo.getLagSubInterfacesStatus.url.split('?')[0],
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgeLagSubInterfacesStatus)
          )
        }
      )
    )
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <EdgeSubInterfacesTab
          isLoading={false}
          ports={edgePortsSetting}
          lags={mockEdgeLagStatusList.data}
          isConfigurable={true}
        />
      </Provider>, {
        route: { params }
      })

    const portTabs = await screen.findAllByRole('tab')
    expect(portTabs.length).toBe(4)
    const portsRow = await screen.findAllByRole('row')
    expect(screen.getByRole('row', {
      name: 'LAN Up 192.168.5.3 Static IP 255.255.255.128 4'
    })).toBeVisible()
    expect(screen.getByRole('row', { name: 'LAN Up DHCP 3' })).toBeVisible()
    expect(portsRow.filter(elem => elem.classList.contains('ant-table-row')).length).toBe(2)
  })

  it('should correctly change tab', async () => {
    render(
      <Provider>
        <EdgeSubInterfacesTab
          isLoading={false}
          ports={edgePortsSetting}
          lags={mockEdgeLagStatusList.data}
          isConfigurable={true}
        />
      </Provider>, {
        route: { params }
      })

    const portTabs = await screen.findAllByRole('tab')
    expect(portTabs.length).toBe(4)

    const port2Tab = await screen.findByRole('tab', { name: 'Port2' })
    await userEvent.click(port2Tab)
    await waitFor(() => {
      expect(port2Tab).toHaveAttribute('aria-selected', 'true')
    })

    const configBtn = await screen.findByRole('button',
      { name: 'Configure Sub-interface Settings' })
    await userEvent.click(configBtn)
    expect(mockedUsedNavigate)
      .toBeCalledWith({
        pathname: '/tenant-id/t/devices/edge/edge-serialnum/edit/sub-interfaces',
        hash: '',
        search: ''
      })
  })

  it('should display no data when no port', async () => {
    render(
      <Provider>
        <EdgeSubInterfacesTab
          isLoading={false}
          ports={[]}
          lags={[]}
          isConfigurable={true}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('No data to display')
  })

  it('should correctly render LAG tab', async () => {
    render(
      <Provider>
        <EdgeSubInterfacesTab
          isLoading={false}
          ports={edgePortsSetting}
          lags={mockEdgeLagStatusList.data}
          isConfigurable={true}
        />
      </Provider>, {
        route: { params }
      })

    const portTabs = await screen.findAllByRole('tab')
    expect(portTabs.length).toBe(4)
    const lag1Tab = await screen.findByRole('tab', { name: 'LAG 1' })
    await userEvent.click(lag1Tab)
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByRole('row', {
      name: 'LAN Up 1.1.1.1 Static IP 255.255.255.128 4'
    })).toBeVisible()
  })
})