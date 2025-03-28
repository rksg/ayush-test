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

import { certList, mockCertName1, mockCertName2, mockCertName3, mockSamlIdpProfileId, mockedSamlIdpProfile, mockedsamlIpdProfileList } from '../__tests__/fixtures'

import { EditSamlIdp } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string, policyId:string }
const editViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.EDIT
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateEncryptionCertificate = jest.fn()
const mockedDeactivateEncryptionCertificate = jest.fn()
const mockedActivateSigningCertificate = jest.fn()
const mockedDeactivateSigningCertificate = jest.fn()

describe('Edit SSO/SAML', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    mockedMainSamlIdpProfile.mockClear()
    mockedActivateEncryptionCertificate.mockClear()
    mockedDeactivateEncryptionCertificate.mockClear()
    mockedActivateSigningCertificate.mockClear()
    mockedDeactivateSigningCertificate.mockClear()

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
        SamlIdpProfileUrls.activateEncryptionCertificate.url,
        (req, res, ctx) => {
          mockedActivateEncryptionCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.delete(
        SamlIdpProfileUrls.deactivateEncryptionCertificate.url,
        (req, res, ctx) => {
          mockedDeactivateEncryptionCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.activateSigningCertificate.url,
        (req, res, ctx) => {
          mockedActivateSigningCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.delete(
        SamlIdpProfileUrls.deactivateSigningCertificate.url,
        (req, res, ctx) => {
          mockedDeactivateSigningCertificate()
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
        <EditSamlIdp />
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
        <EditSamlIdp />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )

    const certCombo = await screen.findByText(mockCertName1)
    await user.click(certCombo)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    })
  })

  it('If change certificate will with certificate delete api call', async () => {

    const user = userEvent.setup()
    render(
      <Provider>
        <EditSamlIdp />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )

    const encryptionCertCombo = await screen.findByText(mockCertName1)
    await user.click(encryptionCertCombo)
    await user.click(await screen.findByText(mockCertName2))

    const signingCertCombo = (await screen.findAllByText(mockCertName3))[0]
    await user.click(signingCertCombo)
    await user.click((await screen.findAllByText(mockCertName1))[1])

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedActivateEncryptionCertificate).toBeCalled())
    await waitFor(() => expect(mockedDeactivateEncryptionCertificate).toBeCalled())
    await waitFor(() => expect(mockedActivateSigningCertificate).toBeCalled())
    await waitFor(() => expect(mockedDeactivateSigningCertificate).toBeCalled())
  })
})