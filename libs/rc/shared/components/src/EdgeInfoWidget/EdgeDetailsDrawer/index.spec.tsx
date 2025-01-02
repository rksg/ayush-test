
import { rest } from 'msw'

import { Features }                                                         from '@acx-ui/feature-toggle'
import { EdgeClusterStatus, EdgeGeneralFixtures, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                              from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady }                                 from '../../useEdgeActions'
import { currentEdge, edgeDnsServers, passwordDetail, tenantID } from '../__tests__/fixtures'

import EdgeDetailsDrawer from '.'

const params: { tenantId: string, serialNumber: string, venueId: string, edgeClusterId: string } =
    // eslint-disable-next-line max-len
    { tenantId: tenantID, serialNumber: currentEdge.serialNumber, venueId: currentEdge.venueId, edgeClusterId: currentEdge.clusterId! }

const user = require('@acx-ui/user')
jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user')
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  // eslint-disable-next-line max-len
  PasswordInput: (props: { value: string }) => <input type='text' data-testid='password-input' readOnly value={props.value ?? ''}/>
}))
const { mockEdgeClusterList } = EdgeGeneralFixtures
const mockCluster = mockEdgeClusterList.data[0] as unknown as EdgeClusterStatus

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('Edge Detail Drawer', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(screen.queryByText('Login Password')).toBeNull()
    expect(screen.queryByText('Enable Password')).toBeNull()
    expect(await screen.findByText('Edge Cluster 1')).toBeVisible()
  })

  it('should render -- if data is undefined', async () => {
    const edgeWithoutModel = { ...currentEdge }
    delete edgeWithoutModel.cpuCores
    delete edgeWithoutModel.firmwareVersion

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={edgeWithoutModel}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
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
        setVisible={jest.fn()}
        currentEdge={undefinedEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(7)
  })

  it('should have correct link to venue detail page', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    const target = await screen.findByText(currentEdge.venueName)
    expect(target.tagName).toBe('A')
    expect(target.getAttribute('href'))
      .toBe(`/${params.tenantId}/t/venues/${currentEdge.venueId}/venue-details/overview`)
  })

  it('should render -- if dnsServers is not setting', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={{ primary: '', secondary: '' }}
      />
    </Provider>, { route: { params } })

    const emptyLabel = await screen.findAllByText('--')
    expect(emptyLabel.length).toBe(2)
  })

  it('should render edge password when role is match', async () => {
    const originMockData = user.useUserProfileContext
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: { support: true , var: true, dogfood: true } }
    })

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getEdgePasswordDetail.url,
        (_req, res, ctx) => res(ctx.json(passwordDetail))
      ))

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Login Password')).toBeVisible()
    expect( screen.getByText('Enable Password')).toBeVisible()

    const passwordInputs = screen.getAllByTestId('password-input')
    await waitFor(() => expect(passwordInputs[0]).toHaveValue(passwordDetail.loginPassword))
    expect(passwordInputs[1]).toHaveValue(passwordDetail.enablePassword)
    user.useUserProfileContext = originMockData
  })

  it('should render "Hierarchical QoS" when HQoS_FF is enabled', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_QOS_TOGGLE)

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Hierarchical QoS')).toBeVisible()
  })

  it('should render "ARP Termination" when ARP_FF is enabled', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockImplementation((feature) =>
      feature === Features.EDGE_ARPT_TOGGLE)

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={currentEdge}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('ARP Termination')).toBeVisible()
  })

  it('should render "vCPUs" as the unit for virtual Edge serial', async () => {
    const edgeWithVirtualSerial = { ...currentEdge }
    edgeWithVirtualSerial.serialNumber = '96B341ADD6C16C11ED8B8B000C296600F2'

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={edgeWithVirtualSerial}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('2 vCPUs')).toBeVisible()
  })

  it('should render "CPUs" as the unit for physical Edge serial', async () => {
    const edgeWithPhysicalSerial = { ...currentEdge }
    edgeWithPhysicalSerial.serialNumber = '190000000001'

    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={jest.fn()}
        currentEdge={edgeWithPhysicalSerial}
        currentCluster={mockCluster}
        dnsServers={edgeDnsServers}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('2 CPUs')).toBeVisible()
  })
})
