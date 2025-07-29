import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }          from '@acx-ui/feature-toggle'
import { serviceApi, policyApi } from '@acx-ui/rc/services'
import {
  CertificateUrls,
  DpskUrls,
  getPolicyDetailsLink, getPolicyRoutePath, MacRegListUrlsInfo,
  PolicyOperation,
  PolicyType,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path }                                        from '@acx-ui/react-router-dom'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { dpskList } from '../AdaptivePolicySetDetail/__tests__/fixtures'

import {
  policySetList,
  prioritizedPolicies,
  adaptivePolicyList,
  macList,
  certificateTemplateList
} from './__tests__/fixtures'

import AdaptivePolicySetTable from './index'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('AdaptivePolicySetTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '79c439e1e5474f68acc9da38fa08a37b'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.getPolicySetsByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macList))
      ),
      rest.post(
        DpskUrls.getEnhancedDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(dpskList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicySetsByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: new RegExp( 'ps12') })
    expect(row).toHaveTextContent('1')
  })

  it.skip('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RulesManagementUrlsInfo.deletePolicySet.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: new RegExp( 'ps2') })
    await userEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    const dialog = await screen.findByRole('dialog')
    await screen.findByText('Delete "ps2"?')

    const deleteListButton = screen.getByRole('button', { name: 'Delete Policy Set' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    await userEvent.click(deleteListButton)

    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await screen.findByText(/Policy Set ps2 was deleted/)
  })

  it('should edit selected row', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: new RegExp( 'ps12') })
    await userEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.EDIT,
      policyId: policySetList.content[0].id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })

  it('should navigate add policy', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    await userEvent.click(await screen.findByText('Add Set'))

    const createPath = getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${createPath}`
    })
  })
})
