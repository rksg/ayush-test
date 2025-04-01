import userEvent from '@testing-library/user-event'

import {
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import {
  mockSamlIdpProfileId,
  mockedMetadata,
  mockedSamlIdpProfileWithRelations
} from '../__tests__/fixtures'

import { SamlIdpMetadataModal } from '.'

const mockedSetVisible = jest.fn()

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

    mockedSetVisible.mockClear()

  })
  it('should render correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpMetadataModal
          samlIdpData={mockedSamlIdpProfileWithRelations}
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    expect(screen.getByText(mockedMetadata)).toBeInTheDocument()

    const okButton = screen.getByRole('button', { name: 'OK' })
    user.click(okButton)
    await waitFor(() => expect(mockedSetVisible).toBeCalledWith(false))
  })

  it('should call visible false when click Close button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SamlIdpMetadataModal
          samlIdpData={mockedSamlIdpProfileWithRelations}
          visible={true}
          setVisible={mockedSetVisible}
        />
      </Provider>
      , { route: { path: detailViewPath, params } }
    )

    expect(screen.getByText(mockedMetadata)).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: 'Close' })
    user.click(cancelButton)
    await waitFor(() => expect(mockedSetVisible).toBeCalledWith(false))
  })
})