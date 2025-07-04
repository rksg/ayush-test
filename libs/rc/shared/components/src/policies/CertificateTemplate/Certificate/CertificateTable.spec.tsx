import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useGetSpecificTemplateCertificatesQuery }                 from '@acx-ui/rc/services'
import { AlgorithmType, CertificateUrls, PersonaUrls }             from '@acx-ui/rc/utils'
import { Provider }                                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                                   from '@acx-ui/types'
import { setUserProfile, getUserProfile }                          from '@acx-ui/user'
import { useTableQuery }                                           from '@acx-ui/utils'

import { certificateList, certificateTemplate } from '../__test__/fixtures'

import { CertificateTable } from './CertificateTable'




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
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render table with correct columns', async () => {
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })
    render(<Provider>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    expect(within(row[0]).getByText('Common name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Status')).toBeInTheDocument()
    expect(within(row[0]).getByText('Expiration Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('CA Name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Template')).toBeInTheDocument()
    expect(within(row[0]).getByText('Identity')).toBeInTheDocument()
    expect(within(row[0]).getByText('Revocation Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Issued By')).toBeInTheDocument()
    expect(within(row[0]).getByText('Timestamp')).toBeInTheDocument()
  })

  it('should open detail drawer when name button is clicked', async () => {
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })
    render(<Provider>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

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

    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })
    render(<Provider>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

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
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })
    render(<Provider>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

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
    const certificateTemplate = {
      id: 'templateId',
      name: 'templateName',
      caType: 'caType',
      keyLength: 123,
      algorithm: AlgorithmType.SHA_256,
      identityGroupId: '123'
    }
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })

    render(<Provider>
      <CertificateTable
        tableQuery={certificateTableQuery.current}
        templateData={certificateTemplate}/></Provider>)

    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(3)
    expect(within(row[0]).getByText('Common name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Status')).toBeInTheDocument()
    expect(within(row[0]).getByText('Expiration Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Revocation Date')).toBeInTheDocument()
    expect(within(row[0]).getByText('Issued By')).toBeInTheDocument()
    expect(within(row[0]).getByText('Timestamp')).toBeInTheDocument()
    expect(within(row[0]).getByText('Identity')).toBeInTheDocument()
    expect(within(row[0]).queryByText('CA Name')).not.toBeInTheDocument()
    expect(within(row[0]).queryByText('Template')).not.toBeInTheDocument()
  })

  it('should render correctly with prime adimin permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
    })

    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })

    render(<Provider><CertificateTable
      tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

    const row = await screen.findByRole('row', { name: /certificate1/ })
    await userEvent.click(row)
    expect(await screen.findByRole('button', { name: 'Revoke' })).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Unrevoke' })).toBeVisible()
  })

  it('should render correctly with read only permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: true,
      scopes: [WifiScopes.READ],
      profile: { ...getUserProfile().profile, roles: [RolesEnum.READ_ONLY] }
    })
    const { result: certificateTableQuery } = renderHook(() =>
      useTableQuery({
        useQuery: useGetSpecificTemplateCertificatesQuery,
        defaultPayload: {},
        apiParams: { templateId: certificateTemplate?.id! }
      }), { wrapper: ({ children }) => <Provider children={children} /> })

    await waitFor(() => {
      expect(certificateTableQuery.current.data).not.toBeUndefined()
    })

    render(<Provider>
      <CertificateTable tableQuery={certificateTableQuery.current}/></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificate/list'
      }
    })

    const row = await screen.findByRole('row', { name: /certificate1/ })
    await userEvent.click(row)
    expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Unrevoke' })).not.toBeInTheDocument()
  })
})
