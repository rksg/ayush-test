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

import { certList, mockCertId2, mockCertName2, mockSamlIdpProfileId, mockSamlIdpProfileName } from '../__tests__/fixtures'

import { AddSamlIdp } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string }
const createViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.CREATE
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateCertificate = jest.fn()

describe('Add SAML IDP Profile', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockedMainSamlIdpProfile.mockClear()
    mockedActivateCertificate.mockClear()

    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.createSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedMainSamlIdpProfile(req.body)
          return res(ctx.json({
            response: {
              id: mockSamlIdpProfileId
            }
          }))
        }
      ),

      rest.put(
        SamlIdpProfileUrls.activateSamlIdpProfileCertificate.url,
        (req, res, ctx) => {
          mockedActivateCertificate()
          return res(ctx.status(202))
        }
      ),

      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(certList))
      )

    )
  })

  it('should create SAML IdP profile successful', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Find metadata textarea and input
    const metadataField = screen.getByTestId('metadata-textarea')
    await user.type(metadataField, 'xmlContent')

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    await user.type(metadataField, 'xmlContent2')

    await user.click(screen.getByTestId('import-xml-button'))

    // Expect there have a drawer displayed with import button
    const importButton = screen.getByRole('button', { name: 'Import' })
    expect(importButton).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    }))
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
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
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    })
  })

  it('If enable encryption and select certificate will call certificate api', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <AddSamlIdp />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, mockSamlIdpProfileName)

    // Find metadata textarea and input
    const metadataField = screen.getByTestId('metadata-textarea')
    await user.type(metadataField, 'xmlContent')

    await user.click(screen.getByRole('switch', { name: 'Enable SAML Response Encryption' }))

    const certCombo = screen.getByRole('combobox', { name: 'Server Certificate' })
    await user.click(certCombo)
    await user.click(await screen.findByText(mockCertName2))

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(mockedMainSamlIdpProfile).toBeCalledWith({
      metadata: Buffer.from('xmlContent').toString('base64'),
      name: mockSamlIdpProfileName,
      responseEncryptionEnabled: true,
      encryptionCertificateId: mockCertId2
    }))

    await waitFor(() => expect(mockedActivateCertificate).toBeCalledTimes(1))
  })
})