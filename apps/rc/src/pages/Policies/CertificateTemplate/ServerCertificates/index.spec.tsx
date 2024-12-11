import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateUrls }                    from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'
import { RolesEnum }                          from '@acx-ui/types'
import { setUserProfile, getUserProfile }     from '@acx-ui/user'

import { serverCertificateList } from '../__test__/fixtures'

import ServerCertificatesTable from '.'

describe('ServerCertificates', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json(serverCertificateList))
      )
    )
  })

  it('should render table with correct columns', async () => {

    render(<Provider>
      <ServerCertificatesTable/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/serverCertificates/list'
      }
    })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    expect(within(row[0]).getByText('Name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Status')).toBeInTheDocument()
    expect(within(row[0]).getByText('Description')).toBeInTheDocument()
    expect(within(row[0]).getByText('Issued By')).toBeInTheDocument()
    expect(within(row[0]).getByText('Valid to')).toBeInTheDocument()
    expect(within(row[0]).getByText('Extended Key Usage')).toBeInTheDocument()
  })

  it('should open detail drawer when name button is clicked', async () => {
    render(<Provider>
      <ServerCertificatesTable/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/serverCertificates/list'
      }
    })

    const name = await screen.findByText('certificate1')

    await userEvent.click(name)
    expect(screen.getByText('Download')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Download' }))
    expect(screen.getByText('View Public Key')).toBeVisible()
  })

  it('should render correctly with prime admin permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
    })

    render(<Provider>
      <ServerCertificatesTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/serverCertificates/list'
      }
    })

    const row = await screen.findByRole('row', { name: /certificate1/ })
    await userEvent.click(row)
    expect(await screen.findByRole('button', { name: 'Download' })).toBeVisible()
  })

  it('should render correctly with read only permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    render(<Provider>
      <ServerCertificatesTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/serverCertificates/list'
      }
    })

    const row = await screen.findByRole('row', { name: /certificate1/ })
    await userEvent.click(row)
    expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Unrevoke' })).not.toBeInTheDocument()
  })
})
