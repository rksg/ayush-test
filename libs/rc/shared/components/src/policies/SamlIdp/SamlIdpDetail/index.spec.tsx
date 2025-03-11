import { rest } from 'msw'

import {
  CertificateUrls,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileUrls,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'

import { certList, mockSamlIdpProfileId, mockedSamlIdpProfile, mockedsamlIpdProfileList } from '../__tests__/fixtures'

import {  SamlIdpDetail } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

let params: { tenantId: string, policyId: string }
const detailViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.DETAIL
})

const mockedMainSamlIdpProfile = jest.fn()
const mockedActivateCertificate = jest.fn()

describe('SSO/SAML Detail', () => {
  beforeEach(() => {

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

    mockedMainSamlIdpProfile.mockClear()

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
    render(
      <Provider>
        <SamlIdpDetail />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )
  })
})