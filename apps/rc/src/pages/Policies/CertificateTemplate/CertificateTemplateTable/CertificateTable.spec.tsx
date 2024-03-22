import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CertificateUrls }                                                        from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { certificateList, certificateTemplate } from '../__test__/fixtures'

import CertificateTable from './CertificateTable'




describe('CertificateTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCertificates.url,
        (req, res, ctx) => res(ctx.json(certificateList))
      ),
      rest.post(
        CertificateUrls.getSpecificTemplateCertificates.url,
        (req, res, ctx) => res(ctx.json(certificateList))
      ),
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(certificateTemplate))
      )
    )
  })

  it('should render table with correct columns', async () => {
    render(<Provider><CertificateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    expect(within(row[0]).getByText('Common name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Status')).toBeInTheDocument()
    expect(within(row[0]).getByText('Expiration Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('CA Name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Template')).toBeInTheDocument()
    expect(within(row[0]).getByText('Revocation Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Issued By')).toBeInTheDocument()
    expect(within(row[0]).getByText('Timestamp')).toBeInTheDocument()
  })

  it('should open detail drawer when name button is clicked', async () => {
    render(<Provider><CertificateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const name = screen.getByText('certificate1')
    await userEvent.click(name)
    expect(screen.getByText('Certificate Details')).toBeVisible()
    expect(screen.getByText('Certificate Information')).toBeVisible()
    expect(screen.getByText('Download')).toBeVisible()
    expect(screen.getByText('Usage')).toBeVisible()
  })

  it('should revoke selected row and should have disabled unrevoke button', async () => {
    const editFn = jest.fn()

    mockServer.use(
      rest.patch(
        CertificateUrls.editCertificate.url,
        (req, res, ctx) => {
          editFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><CertificateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /certificate1/ })
    await userEvent.click(within(row).getByRole('radio'))
    const unrevoke = screen.getByRole('button', { name: /Unrevoke/ })
    expect(unrevoke).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Revoke/ }))
    expect(await screen.findByText('Revoke "' + 'certificate1' + '"?')).toBeVisible()
    const revoke = await screen.findByLabelText('Type the reason to revoke')
    await userEvent.type(revoke, 'revokeReason1')
    const okButton = await screen.findByRole('button', { name: /OK/ })
    await userEvent.click(okButton)

    await waitFor(() => {
      expect(editFn).toHaveBeenCalled()
    })
  })

  it('should unrevoke selected row and should have disabled revoke button', async () => {
    const editFn = jest.fn()

    mockServer.use(
      rest.patch(
        CertificateUrls.editCertificate.url,
        (req, res, ctx) => {
          editFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><CertificateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /certificate2/ })
    await userEvent.click(within(row).getByRole('radio'))
    const revoke = screen.getByRole('button', { name: /Revoke/ })
    expect(revoke).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /Unrevoke/ }))

    await waitFor(() => {
      expect(editFn).toHaveBeenCalled()
    })
  })

  it('should show fewer column when templateId exist', async () => {
    render(<Provider><CertificateTable templateId='123'/></Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    expect(within(row[0]).getByText('Common name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Status')).toBeInTheDocument()
    expect(within(row[0]).getByText('Expiration Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Revocation Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Issued By')).toBeInTheDocument()
    expect(within(row[0]).getByText('Timestamp')).toBeInTheDocument()
    expect(within(row[0]).queryByText('CA Name')).not.toBeInTheDocument()
    expect(within(row[0]).queryByText('Template')).not.toBeInTheDocument()
  })
})
