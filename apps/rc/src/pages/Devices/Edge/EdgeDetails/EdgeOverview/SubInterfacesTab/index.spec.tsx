import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }    from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockEdgeSubInterfacesStatus,
  edgePortsSetting
} from '../../../__tests__/fixtures'

import { EdgeSubInterfacesTab } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge overview sub-interfaces tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'tenant-id', serialNumber: 'edge-serialnum' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeSubInterfacesStatusList.url,
        (_req, res, ctx) => {
          return res(
            ctx.json(mockEdgeSubInterfacesStatus)
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
        />
      </Provider>, {
        route: { params }
      })

    const portTabs = await screen.findAllByRole('tab')
    expect(portTabs.length).toBe(2)
    const portsRow = await screen.findAllByRole('row')
    expect(screen.getByRole('row', {
      name: 'LAN Up 192.168.5.3 Static IP 255.255.255.128 4'
    })).toBeValid()
    expect(screen.getByRole('row', { name: 'LAN Up DHCP 3' })).toBeValid()
    expect(portsRow.filter(elem => elem.classList.contains('ant-table-row')).length).toBe(2)
  })

  it('should correctly change tab', async () => {
    render(
      <Provider>
        <EdgeSubInterfacesTab
          isLoading={false}
          ports={edgePortsSetting}
        />
      </Provider>, {
        route: { params }
      })

    const portTabs = await screen.findAllByRole('tab')
    expect(portTabs.length).toBe(2)

    const port2Tab = await screen.findByRole('tab', { name: 'Port 2' })
    await userEvent.click(port2Tab)
    await waitFor(() => {
      expect(port2Tab).toHaveAttribute('aria-selected', 'true')
    })

    const configBtn = await screen.findByRole('button',
      { name: 'Configure Sub-interface Settings' })
    await userEvent.click(configBtn)
    expect(mockedUsedNavigate)
      .toBeCalledWith({
        pathname: '/tenant-id/t/devices/edge/edge-serialnum/edit/ports/sub-interface',
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
        />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('No data to display')
  })
})