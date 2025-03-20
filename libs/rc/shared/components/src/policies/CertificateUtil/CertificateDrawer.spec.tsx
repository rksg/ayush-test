import { rest } from 'msw'

import { CertificateUrls, ExtendedKeyUsages } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen }         from '@acx-ui/test-utils'

import { caList, certList } from './__test__/fixtures'
import CertificateDrawer    from './CertificateDrawer'

describe('Add Certificate Drawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(caList))
      ),
      rest.post(
        CertificateUrls.getCertificateList.url,
        (req, res, ctx) => res(ctx.json(certList))
      )
    )
  })

  const params = { tenantId: 'b6c136f68ae7464b9bbc9092c18fc189' }

  it('should render add Certificate drawer correctly', async () => {

    render(
      <Provider>
        <CertificateDrawer
          visible={true}
          setVisible={jest.fn()}
          handleSave={jest.fn()}
          extendedKeyUsages={[ExtendedKeyUsages.CLIENT_AUTH]} />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getAllByText('Generate Certificate')?.[0]).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})