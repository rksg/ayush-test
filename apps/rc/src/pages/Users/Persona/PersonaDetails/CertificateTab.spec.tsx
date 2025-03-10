import { rest } from 'msw'

import { useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { AlgorithmType, CertificateTemplate, CertificateUrls } from '@acx-ui/rc/utils'
import { Provider }                                            from '@acx-ui/store'
import { mockServer, render, waitFor, screen }                 from '@acx-ui/test-utils'

import { mockPersona, mockPersonaGroup } from '../__tests__/fixtures'

import CertificateTab from './CertificateTab'

import { IdentityDetailsContext } from '.'

const mockedCertTemplate: CertificateTemplate = {
  id: 'ddc7b2001a594a5484e56ffcae450601',
  name: 'TargetCertTemplate',
  caType: 'ONBOARD',
  defaultAccess: false,
  keyLength: 2048,
  algorithm: AlgorithmType.SHA_256,
  certificateCount: 39,
  certificateNames: [],
  variables: [
    'USERNAME'
  ],
  networkIds: [
    '4c06305479fb4084b87917043b0fee06'
  ],
  networkCount: 1,
  identityGroupId: 'cb906845-8fa4-4075-a98b-3c34f56595f9'
}

const mockedCertList = {
  fields: null,
  totalCount: 10,
  totalPages: 1,
  page: 1,
  data: [ ]
}

const getCertInstanceFn = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  CertificateTable: () => <div data-testid='CerttificateTable'></div>
}))

describe('Certificate Tab', () => {
  getCertInstanceFn.mockClear()

  let params: { tenantId: string, personaGroupId: string, personaId: string }
  params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    personaGroupId: mockPersona.groupId,
    personaId: mockPersona.id
  }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (_, res, ctx) => {
          getCertInstanceFn()
          return res(ctx.json(mockedCertTemplate))
        }
      ),
      rest.post(
        CertificateUrls.getCertificatesByIdentity.url,
        (_, res, ctx) => res(ctx.json(mockedCertList))
      )
    )
  })

  it('should render certificate tab correctly', async () => {
    const setCountFn = jest.fn()
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <IdentityDetailsContext.Provider value={{
        setDeviceCount: jest.fn(),
        setCertCount: setCountFn,
        setDpskCount: jest.fn(),
        setMacAddressCount: jest.fn() }}
      >
        <CertificateTab
          personaData={mockPersona}
          personaGroupData={mockPersonaGroup}
        />
      </IdentityDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId'
      }
    })

    await waitFor(() => expect(getCertInstanceFn).toBeCalled())
    const targetCertTemplateName = mockedCertTemplate.name

    // Make sure the resource banner is displayed
    expect(screen.getByRole('link', { name: targetCertTemplateName })).toBeInTheDocument()
    // Make sure the certificate table is displayed
    expect(screen.getByTestId('CerttificateTable')).toBeInTheDocument()
    // Make sure the certificate count is set correctly
    await waitFor(() => expect(setCountFn).toBeCalledWith(mockedCertList.totalCount))
  })
})
