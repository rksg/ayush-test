import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateUrls }                                                        from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                                                  from '@acx-ui/types'
import { setUserProfile, getUserProfile }                                         from '@acx-ui/user'

import { certificateAuthorityList, certificateTemplateList } from '../__tests__/fixtures'

import CertificateAuthorityTable from './CertificateAuthorityTable'




describe('CertificateAuthorityTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getSubCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      )
    )
  })

  it('should render table with correct columns', async () => {
    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Templates')).toBeInTheDocument()
    expect(screen.getByText('Common Name')).toBeInTheDocument()
    expect(screen.getByText('SHA Fingerprint')).toBeInTheDocument()
    expect(screen.getByText('Expires')).toBeInTheDocument()

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(4)
  })

  it('should show tooltip when hover over templates', async () => {
    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /onboard2/ })
    await userEvent.hover(within(row).getByText('3'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/testCertificateTemplate/)
  })

  it('should open detail drawer when name button is clicked', async () => {
    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const name = screen.getByText('onboard2')
    await userEvent.click(name)
    expect(screen.getByText('Certificate Authority Details')).toBeVisible()
    expect(screen.getByText('Certificate Authority Information')).toBeVisible()
    expect(screen.getByText('View & Upload')).toBeVisible()
    expect(screen.getByText('Sub CAs (0)')).toBeVisible()
    expect(screen.getByText('Certificate Templates (3)')).toBeVisible()
  })

  it('should handle delete correctly', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        CertificateUrls.deleteCA.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // block in-used CA from delete
    const row1 = await screen.findByRole('row', { name: /onboard1/ })
    await userEvent.click(within(row1).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in network')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    // should delete selected row
    const row2 = await screen.findByRole('row', { name: /onboard3/ })
    await userEvent.click(within(row2).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    expect(await screen.findByText('Delete "onboard3"?')).toBeVisible()
    const deleteInput = screen.getByLabelText('Type the word "Delete" to confirm')
    await userEvent.type(deleteInput, 'Delete')
    await userEvent.click(await screen.findByRole('button', { name: 'Delete CA' }))

    await waitFor(() => {
      expect(deleteFn).toBeCalledTimes(1)
    })
  })

  it('should open edit modal', async () => {
    const editFn = jest.fn()

    mockServer.use(
      rest.patch(
        CertificateUrls.editCA.url,
        (req, res, ctx) => {
          editFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /onboard2/ })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))
    const caNameInput = screen.getByLabelText('CA Name')
    const descriptionInput = screen.getByLabelText('Description')
    await userEvent.type(caNameInput, 'newName')
    await userEvent.type(descriptionInput, 'newDescription')
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(editFn).toHaveBeenCalled()
    })
  })

  it('should render correctly with prime admin', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
    })

    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /onboard2/ })
    await userEvent.click(row)
    expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeVisible()
  })

  it('should render correctly with read only permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })

    render(<Provider><CertificateAuthorityTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateAuthority/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /onboard2/ })
    await userEvent.click(row)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
