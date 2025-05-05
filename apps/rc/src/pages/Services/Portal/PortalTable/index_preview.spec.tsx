import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  getServiceRoutePath,
  PortalUrlsInfo,
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

import { mockedPortalList, networksResponse, mockDetailResult } from './__tests__/fixtures'

import PortalTable from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: '/__tenantId__/t',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

jest.mock('@acx-ui/rc/components', () => ({
  PortalPreviewModal: () => <div data-testid='PortalPreviewModal' />,
  SimpleListTooltip: () => <div data-testid='SimpleListTooltip' />,
  getLanguage: () => 'English',
  initialPortalData: {
    network: [],
    content: {}
  }
}))

describe('PortalTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    imageId: 'imageId'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedPortalList }))
      ),
      rest.get(
        PortalUrlsInfo.getPortal.url,
        (req, res, ctx) => res(ctx.json(mockDetailResult))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the', accept: 'accept' }))

        }),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networksResponse))
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(networksResponse))
      ),
      rest.get(
        `${window.location.origin}/api/file/tenant/:tenantId/:imageId/url`,
        (req, res, ctx) => {
          return res(ctx.json({ signedUrl: 'url' }))
        }
      )
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <PortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedPortalList.content[1]
    expect(await screen.findByRole('button', { name: /Add Guest Portal/i })).toBeVisible()
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.serviceName) })
    expect(row).toBeVisible()
    await userEvent.click(row)
    expect(await screen.findByText('1 selected')).toBeVisible()
  })
})
