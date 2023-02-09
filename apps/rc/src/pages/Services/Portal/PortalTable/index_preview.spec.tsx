import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
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

import { mockedPortalList } from './__tests__/fixtures'

import PortalTable from '.'

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

describe('PortalTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        PortalUrlsInfo.getPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedPortalList }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the', accept: 'accept' }))
        })
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
    await new Promise((r)=>{setTimeout(r, 500)})
  })
})
