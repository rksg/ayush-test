import { rest } from 'msw'


import { AlgorithmType, CertificateUrls } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'


import { certificateAuthorityList } from '../__tests__/fixtures'

import EditCertificateAuthorityForm from './EditCertificateAuthorityForm'

describe('EditCertificateAuthorityForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      )
    )
  })

  it('should render the form with initial values', () => {
    render(
      <Provider>
        <EditCertificateAuthorityForm
          data={{
            id: '1',
            name: 'Certificate Authority 1',
            description: 'Description 1',
            commonName: 'Common Name',
            startDate: '2022-01-01',
            expireDate: '2023-01-01',
            keyLength: 2048,
            algorithm: AlgorithmType.SHA_256
          }}
          modal={{
            update: jest.fn(),
            destroy: jest.fn()
          }}
        />
      </Provider>
    )

    expect(screen.getByLabelText('CA Name')).toHaveValue('Certificate Authority 1')
    expect(screen.getByLabelText('Description')).toHaveValue('Description 1')
  })
})
