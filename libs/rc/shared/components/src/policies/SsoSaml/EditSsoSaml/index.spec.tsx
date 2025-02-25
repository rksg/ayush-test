import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CertificateUrls,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certList, mockCertName1, mockCertName2, mockSamlIdpProfileId, mockedSamlIdpProfile, mockedsamlIpdProfileList } from '../__tests__/fixtures'

import { EditSsoSaml } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string, policyId:string }
const editViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SSO_SAML,
  oper: PolicyOperation.EDIT
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateCertificate = jest.fn()
const mockedDeactivateCertificate = jest.fn()

describe('Edit SSO/SAML', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    mockedMainSamlIdpProfile.mockClear()
    mockedActivateCertificate.mockClear()
    mockedDeactivateCertificate.mockClear()

    mockServer.use(
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedSamlIdpProfile))
        }
      ),

      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedsamlIpdProfileList))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.updateSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedMainSamlIdpProfile(req.body)
          return res(ctx.status(202))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.activateSamlIdpProfileCertificate.url,
        (req, res, ctx) => {
          mockedActivateCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.delete(
        SamlIdpProfileUrls.deactivateSamlIdpProfileCertificate.url,
        (req, res, ctx) => {
          mockedDeactivateCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(certList))
      )
    )
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EditSsoSaml />
      </Provider>
      , { route: { path: editViewPath, params } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Identity Provider'
    })).toBeVisible()
  })

  it('Click cancel button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditSsoSaml />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )

    const certCombo = await screen.findByText(mockCertName1)
    await user.click(certCombo)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/identityProvider/list`,
      hash: '',
      search: ''
    })
  })

  it('If change certificate will with certificate delete api call', async () => {

    const user = userEvent.setup()
    render(
      <Provider>
        <EditSsoSaml />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )

    const certCombo = await screen.findByText(mockCertName1)
    await user.click(certCombo)
    await user.click(await screen.findByText(mockCertName2))

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedActivateCertificate).toBeCalled())
    await waitFor(() => expect(mockedDeactivateCertificate).toBeCalled())
  })
})