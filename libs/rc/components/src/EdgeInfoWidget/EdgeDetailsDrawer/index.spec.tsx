import userEvent from '@testing-library/user-event'

import { EdgeStatus }     from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { tenantID, currentEdge, edgePortsSetting, edgeDnsServers, passwordDetail } from '../__tests__/fixtures'

import EdgeDetailsDrawer from '.'

const params: { tenantId: string, serialNumber: string, venueId: string } =
    { tenantId: tenantID, serialNumber: currentEdge.serialNumber, venueId: currentEdge.venueId }

const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))

describe('Edge Detail Drawer', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
        passwordDetail={passwordDetail}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Properties')).toBeVisible()
    expect(screen.queryByText('Login Password')).toBeNull()
    expect(screen.queryByText('Enable Password')).toBeNull()
  })

  it('should render -- if data is undefined', async () => {
    const edgeWithoutModel = { ...currentEdge }
    delete edgeWithoutModel.cpuCores
    delete edgeWithoutModel.firmwareVersion

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={edgeWithoutModel}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
        passwordDetail={passwordDetail}
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
        passwordDetail={passwordDetail}
      />
    </Provider>, { route: { params } })

    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(7)
  })

  it('should have correct link to venue detail page', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
        passwordDetail={passwordDetail}
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
        passwordDetail={passwordDetail}
      />
    </Provider>, { route: { params } })

    await user.click(screen.getByRole('radio', { name: 'Settings' }))
    await screen.findAllByText('DNS Server')
    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(2)
  })

  it('should render edge password when role is match', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: { support: true , var: true, dogfood: true } }
    })

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        dnsServers={edgeDnsServers}
        edgePortsSetting={edgePortsSetting}
        passwordDetail={passwordDetail}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Login Password')).toBeVisible()
    expect(await screen.findByText('Enable Password')).toBeVisible()
  })
})
