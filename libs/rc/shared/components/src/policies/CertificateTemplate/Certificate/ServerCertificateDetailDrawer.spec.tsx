import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { serverCertificate } from '../__tests__/fixtures'

import { ServerCertificateDetailDrawer } from './ServerCertificateDetailDrawer'

describe('ServerCertificatesDetailDrawer', () => {

  it('should render certificate correctly', async () => {
    render(
      <Provider>
        <ServerCertificateDetailDrawer
          open={true}
          setOpen={() => { }}
          data={serverCertificate} />
      </Provider>, {
        route: {
          params: { tenantId: 't-id' },
          path: '/:tenantId/serverCertificate/list'
        }
      })

    expect(await screen.findByText('View Public Key')).toBeVisible()
    expect(await screen.findByText('View Chain')).toBeVisible()
    expect(await screen.findAllByText('Download PEM')).toHaveLength(2)

  })
})
