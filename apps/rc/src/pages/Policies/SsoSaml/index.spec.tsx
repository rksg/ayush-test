import { rest } from 'msw'

import {
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyListRoutePath,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockedSamlIpdProfileList } from './__tests__/fixtures'

import SsoSaml from '.'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
const mockedUsedNavigate = jest.fn()

const mockUseLocationValue = {
  pathname: getPolicyListRoutePath(),
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

describe('SSO/SAML Table', ()=>{

  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.SSO_SAML,
    oper: PolicyOperation.LIST
  })

  beforeEach(() => {
    params = {
      tenantId: tenantId
    }

    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedSamlIpdProfileList))
        }
      )
    )
  })

  it('should create SSO/SAML table successfully', async () => {

    render(
      <Provider>
        <SsoSaml />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /__samlIdpProfile_Name/i })
    await waitFor(() =>{
      expect(row.length).toBe(mockedSamlIpdProfileList.totalCount)
    })
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SsoSaml />
      </Provider>, {
        route: { params, path: tablePath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })
})
