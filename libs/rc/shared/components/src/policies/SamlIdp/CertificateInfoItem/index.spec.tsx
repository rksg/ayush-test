import {
  CertificateStatusType,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {  certList,  mockCertId3, mockCertName3, mockSamlIdpProfileId } from '../__tests__/fixtures'

import { CertificateInfoItem } from '.'

let params: { tenantId: string, policyId: string }
const detailViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.DETAIL
})
describe('CertificateInfoItem', () => {
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      policyId: mockSamlIdpProfileId
    }

  })
  it('should render correctly - for ON case', () => {
    render(
      <Provider>
        <CertificateInfoItem
          certificateNameMap={
            certList.data as unknown as {
                key: string, value: string, status: CertificateStatusType[]
            }[]
          }
          certificatFlag={true}
          certificatId={mockCertId3}
        />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    expect(screen.getByRole('link', { name: mockCertName3 })).toBeVisible()
  })

  it('should render correctly - for OFF case', () => {
    render(
      <Provider>
        <CertificateInfoItem
          certificateNameMap={
            certList.data as unknown as {
                key: string, value: string, status: CertificateStatusType[]
            }[]
          }
          certificatFlag={false}
        />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    expect(screen.getByText('OFF')).toBeVisible()
  })
})