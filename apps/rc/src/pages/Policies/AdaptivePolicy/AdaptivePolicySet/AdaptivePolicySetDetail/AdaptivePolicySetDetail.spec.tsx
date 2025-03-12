import { rest } from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CertificateUrls,
  CommonUrlsInfo,
  DpskUrls,
  MacRegListUrlsInfo,
  PersonaUrls,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'


import {
  adaptivePolicy,
  certificateTemplateList,
  dpskList,
  identityGroupList,
  macList,
  networkList,
  prioritizedPolicies
} from './__test__/fixtures'
import AdaptivePolicySetDetail from './AdaptivePolicySetDetail'

describe('AdaptivePolicySetDetail', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicy))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.get(
        DpskUrls.getDpskList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(dpskList))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(networkList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(macList))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(certificateTemplateList))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(identityGroupList))
      )
    )
  })

  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '373377b0cb6e46ea8982b1c80aabe1fa',
    templateId: '200'
  }

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    await screen.findByText('Policy Set Name')

    const names = await screen.findAllByText(adaptivePolicy.name)
    expect(names).toHaveLength(2)
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Adaptive Policy Sets'
    })).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('renders the associated services table with all types of services when isIdentityGroupIntegration is true', async () => {
    // Mock feature toggle to enable isIdentityGroupIntegration
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.POLICY_IDENTITY_TOGGLE)

    render(<Provider><AdaptivePolicySetDetail /></Provider>, {
      route: { params, path: '/:tenantId/:policyId' }
    })

    // Wait for async data loading
    expect(await screen.findByText('Associated Services (7)')).toBeInTheDocument()
    expect(await screen.findByText('123123')).toBeInTheDocument()
    expect(await screen.findByText('Registration pool')).toBeInTheDocument()
    expect(await screen.findByText('A1_DPSK_AccessPolicySet')).toBeInTheDocument()
    expect(await screen.findByText('Amazing')).toBeInTheDocument()

    // Verify table content rows
    expect(screen.getAllByText('Certificate Template')).toHaveLength(2)
    expect(screen.getAllByText('MAC Registration List')).toHaveLength(1)
    expect(screen.getAllByText('DPSK Service')).toHaveLength(2)
    expect(screen.getAllByText('Identity Group')).toHaveLength(2)

    // Verify network count column
    expect(screen.getByText('15')).toBeInTheDocument() // MAC Pool 1 networkCount
    expect(screen.getByText('13')).toBeInTheDocument() // DPSK Pool 1 networkCount
    expect(screen.getByText('12')).toBeInTheDocument() // Certificate Template 1 networkCount
    expect(screen.getByText('14')).toBeInTheDocument() // Identity Group 1 networkCount
  })
})
