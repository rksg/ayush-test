import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { samlIdpProfileApi } from '@acx-ui/rc/services'
import {
  CertificateUrls,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { certList, mockCertName1, mockCertName2, mockCertName3, mockSamlIdpProfileId, mockSamlIdpProfileId2, mockedSamlIdpProfile, mockedSamlIdpProfileByURL, mockedSamlIdpProfileList } from '../__tests__/fixtures'

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

const mockedGetSamlIdpProfile = jest.fn()
const mockedGetSamlIdpProfileViewDataList = jest.fn()
const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateEncryptionCertificate = jest.fn()
const mockedDeactivateEncryptionCertificate = jest.fn()
const mockedActivateSigningCertificate = jest.fn()
const mockedDeactivateSigningCertificate = jest.fn()

describe('Edit SAML IdP Profile', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    jest.clearAllMocks()

    store.dispatch(samlIdpProfileApi.util.resetApiState())

    mockServer.use(
      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (req, res, ctx) => {
          mockedGetSamlIdpProfile()
          if (req.params.id === mockSamlIdpProfileId) {
            return res(ctx.json(mockedSamlIdpProfile))
          }
          return res(ctx.json(mockedSamlIdpProfileByURL))
        }
      ),

      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          mockedGetSamlIdpProfileViewDataList()
          return res(ctx.json(mockedSamlIdpProfileList))
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

  it('Click apply button and go back to list page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditSamlIdp />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )

    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalled())
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalled())

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedMainSamlIdpProfile).toBeCalled())
    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalledTimes(2))
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalledTimes(2))

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

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/list`,
      hash: '',
      search: ''
    })

    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalledTimes(2))
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalledTimes(2))
  })


  it('turn off encryption and signing certificate', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EditSamlIdp />
      </Provider>
      ,{ route: { path: editViewPath, params } }
    )
    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalled())
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalled())

    //get the Enable SAML Response Encryption switch
    const encryptionSwitch = screen.getByRole('switch', { name: 'Enable SAML Response Encryption' })
    expect(encryptionSwitch).toBeChecked()

    //get the Enable SAML Request Signature switch
    const signingSwitch = screen.getByRole('switch', { name: 'Enable SAML Request Signature' })
    expect(signingSwitch).toBeChecked()

    await user.click(screen.getByRole('switch', { name: 'Enable SAML Response Encryption' }))
    await user.click(screen.getByRole('switch', { name: 'Enable SAML Request Signature' }))

    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(mockedDeactivateEncryptionCertificate).toBeCalled())
    await waitFor(() => expect(mockedDeactivateSigningCertificate).toBeCalled())


    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalledTimes(2))
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalledTimes(2))
  })

  it('should show metadataUrl in metadataContent', async () => {
    render(
      <Provider>
        <EditSamlIdp />
      </Provider>
      , { route: { path: editViewPath, params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: mockSamlIdpProfileId2
      } } }
    )
    await waitFor(() => expect(mockedGetSamlIdpProfileViewDataList).toBeCalled())
    await waitFor(() => expect(mockedGetSamlIdpProfile).toBeCalled())

    expect(screen.getByText(mockedSamlIdpProfileByURL.metadataUrl)).toBeVisible()
  })
})
