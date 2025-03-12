import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { CertificateUrls, CommonUrlsInfo, PersonaUrls, PolicyOperation, PolicyType, getPolicyDetailsLink } from '@acx-ui/rc/utils'
import { Provider }                                                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within }                          from '@acx-ui/test-utils'
import { RolesEnum, WifiScopes }                                                                           from '@acx-ui/types'
import { setUserProfile, getUserProfile }                                                                  from '@acx-ui/user'

import { certificateAuthorityList, certificateTemplate, certificateTemplateList } from '../__test__/fixtures'

import CertificateTemplateTable from './CertificateTemplateTable'


const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/t-id',
  search: '',
  hash: ''
}
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe.skip('CertificateTemplateTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json(certificateAuthorityList))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json({
          data: [
            { name: 'testAAA-ct', id: 'testNetworkId1' },
            { name: 'testAAA-ct2', id: 'testNetworkId2' }]
        }))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render table with correct columns', async () => {
    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row')
    expect(row.length).toBe(4)
    expect(within(row[0]).getByText('Name')).toBeInTheDocument()
    expect(within(row[0]).getByText('CA Type')).toBeInTheDocument()
    expect(within(row[0]).getByText('Certificates')).toBeInTheDocument()
    expect(within(row[0]).getByText('Networks')).toBeInTheDocument()
    expect(within(row[0]).getByText('Common Name')).toBeInTheDocument()
    expect(within(row[0]).getByText('Certificate Authority')).toBeInTheDocument()
    expect(within(row[0]).getByText('Adaptive Policy Set')).toBeInTheDocument()
    expect(within(row[0]).getByText('Identity Group')).toBeInTheDocument()
  })

  it('should show tooltip when hover over templates', async () => {
    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /certificateTemplate1/ })
    await userEvent.hover(within(row).getByText('2'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/testCertificate/)
  })

  it('should show more info in tooltip when hover over templates', async () => {
    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /certificateTemplate2/ })
    await userEvent.hover(within(row).getByText('27'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/And 1 More.../)
  })

  it('should show tooltip when hover over network', async () => {
    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /certificateTemplate2/ })
    await userEvent.hover(within(row).getByText('2'))
    expect(await screen.findByRole('tooltip')).toHaveTextContent(/testAAA-ct/)
  })

  it('should handle delete correctly', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        CertificateUrls.deleteCertificateTemplate.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // block in-used template from delete
    const row1 = await screen.findByRole('row', { name: /certificateTemplate2/ })
    await userEvent.click(within(row1).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in network')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    // should delete selected row
    const row2 = await screen.findByRole('row', { name: /certificateTemplate3/ })
    await userEvent.click(within(row2).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    expect(await screen.findByText('Delete "certificateTemplate3"?')).toBeVisible()
    const deleteInput = await screen.findByLabelText('Type the word "Delete" to confirm')
    await userEvent.type(deleteInput, 'Delete')
    await userEvent.click(await screen.findByRole('button', { name: 'Delete template' }))

    await waitFor(() => {
      expect(deleteFn).toBeCalledTimes(1)
    })
  })

  it('should redirect to edit page when edit button is clicked', async () => {
    mockServer.use(
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(certificateTemplate))
      )
    )

    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /certificateTemplate1/ })
    await userEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.CERTIFICATE_TEMPLATE,
      oper: PolicyOperation.EDIT,
      policyId: '84d3b18d00964fe0b4740eedb6623930'
    })

    await waitFor(() => {
      expect(mockedUsedNavigate).toBeCalledWith({
        hash: '',
        pathname: 't/t-id/' + editPath,
        search: ''
      })
    })
  })

  it('should render correctly with prime admin permission', async () => {
    setUserProfile({
      ...getUserProfile(),
      abacEnabled: true,
      isCustomRole: false,
      profile: { ...getUserProfile().profile, roles: [RolesEnum.PRIME_ADMIN] }
    })

    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /certificateTemplate1/ })
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

    render(<Provider><CertificateTemplateTable /></Provider>, {
      route: {
        params: { tenantId: 't-id' },
        path: '/:tenantId/policies/certificateTemplate/list'
      }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /certificateTemplate1/ })
    await userEvent.click(row)
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
