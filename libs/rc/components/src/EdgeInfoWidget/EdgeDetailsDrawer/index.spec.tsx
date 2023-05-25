import userEvent from '@testing-library/user-event'

import { EdgeStatus }                from '@acx-ui/rc/utils'
import { Provider  }                 from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { tenantID, currentEdge, edgePortsSetting, edgeDnsServers } from '../__tests__/fixtures'

import EdgeDetailsDrawer from '.'

const params: { tenantId: string, serialNumber: string, venueId: string } =
    { tenantId: tenantID, serialNumber: currentEdge.serialNumber, venueId: currentEdge.venueId }

describe('Edge Detail Drawer', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Properties')).toBeVisible()
    fireEvent.click(screen.getByText('Settings'))
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })

  it('should render -- if data is undefined', async () => {
    const edgeWithoutModel = { ...currentEdge }
    delete edgeWithoutModel.cpuUsed
    delete edgeWithoutModel.firmwareVersion

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={edgeWithoutModel}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(2)
  })

  it('should render -- if edge is undefined', async () => {
    const undefinedEdge = {} as EdgeStatus

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={undefinedEdge}
        edgePortsSetting={edgePortsSetting}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(8)
  })

  it('should have correct link to venue detail page', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    const target = await screen.findByText(currentEdge.venueName)
    expect(target.tagName).toBe('A')
    expect(target.getAttribute('href'))
      .toBe(`/${params.tenantId}/t/venues/${currentEdge.venueId}/venue-details/overview`)
  })

  it('should render -- if dnsServers is not setting', async () => {
    const user = userEvent.setup()
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={{ primary: '', secondary: '' }}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    await user.click(screen.getByRole('radio', { name: 'Settings' }))
    await screen.findAllByText('DNS Server')
    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(2)
  })
})
