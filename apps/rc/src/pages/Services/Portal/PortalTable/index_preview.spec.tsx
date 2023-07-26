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

import { mockedPortalList, networksResponse } from './__tests__/fixtures'

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
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the', accept: 'accept' }))
        }),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networksResponse))
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

    const targetPortal = mockedPortalList.content[0]
    expect(await screen.findByRole('button', { name: /Add Guest Portal/i })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(targetPortal.serviceName) })).toBeVisible()
    await userEvent.click(await screen.findByLabelText('78f92fbf80334e8b83cddd3210db4920'))
    expect(await screen.findByText('1 selected')).toBeVisible()
  })
})
