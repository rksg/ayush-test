import { rest } from 'msw'

import {
  getServiceRoutePath,
  PropertyUrlsInfo,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Path }     from '@acx-ui/react-router-dom'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockPropertyConfigs } from '../__tests__/fixtures'

import ResidentPortalVenuesTable from './ResidentPortalVenuesTable'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/ecc2d7cf9d2342fdb31ae0e24958fcac',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('ResidentPortalVenuesTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: '123545'
  }

  const tablePath =
    '/:tenantId/'
    + getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.DETAIL })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (req, res, ctx) => res(ctx.json({ ...mockPropertyConfigs }))
      )
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <ResidentPortalVenuesTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetConfig = mockPropertyConfigs.content[0]
    expect(await screen.findByRole('row', { name: new RegExp(targetConfig.venueName) }))
      .toBeVisible()

    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toContain(
      `${mockedTenantPath.pathname}/venues/${targetConfig.venueId}/venue-details/overview`
    )
  })

})
