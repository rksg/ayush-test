import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  DpskUrls,
  getServiceDetailsLink,
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
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { mockedDetailedResidentPortalList, mockedResidentPortal, mockedResidentPortalList, mockPropertyConfigs } from '../__tests__/fixtures'
import ResidentPortalDetail from './ResidentPortalDetail'

// import { mockedDpskList, mockedDpskListWithPersona } from './__tests__/fixtures'
// import DpskTable                                     from './DpskTable'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('ResidentPortalDetail', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: '12345'
  }

  const detailPath = 
    '/:tenantId/' 
    + getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.DETAIL })

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PropertyUrlsInfo.getResidentPortal.url,
        (req, res, ctx) => res(ctx.json({ ...mockedResidentPortal }))
      ),
      rest.get(
        PropertyUrlsInfo.getResidentPortalLogo.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.get(
        PropertyUrlsInfo.getResidentPortalFavicon.url,
        (req, res, ctx) => res(ctx.status(404))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (req, res, ctx) => res(ctx.json({ ... mockPropertyConfigs }))
      )
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <ResidentPortalDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByRole('button', { name: /Configure/i })).toBeVisible()

    const nameInput = await screen.findByText(mockedResidentPortal.name)
    expect(nameInput).toBeInTheDocument()

    const titleInput = await screen.findByText(mockedResidentPortal.uiConfiguration?.text.title)
    expect(titleInput).toBeInTheDocument()

    const subtitleInput = await screen.findByText(mockedResidentPortal.uiConfiguration?.text.subTitle)
    expect(subtitleInput).toBeInTheDocument()

    const loginInput = await screen.findByText(mockedResidentPortal.uiConfiguration?.text.loginText)
    expect(loginInput).toBeInTheDocument()

    const announcementsInput = await screen.findByText(mockedResidentPortal.uiConfiguration?.text.announcements)
    expect(announcementsInput).toBeInTheDocument()

    const helpInput = await screen.findByText(mockedResidentPortal.uiConfiguration?.text.helpText)
    expect(helpInput).toBeInTheDocument()

    // TODO: color scheme and logos?
  })
})
