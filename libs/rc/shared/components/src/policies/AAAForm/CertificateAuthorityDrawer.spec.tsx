
import { rest } from 'msw'

import { CertificateUrls } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { caList }                 from './__tests__/fixtures'
import CertificateAuthorityDrawer from './CertificateAuthorityDrawer'


describe('Add Certificate Authority Drawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(caList))
      )
    )
  })

  const params = { tenantId: 'b6c136f68ae7464b9bbc9092c18fc189' }

  it('should render add Certificate Authority drawer correctly', async () => {
    render(
      <Provider>
        <CertificateAuthorityDrawer
          visible={true}
          setVisible={jest.fn()}
          handleSave={jest.fn()} />
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Add Certificate Authority')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Add' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
})