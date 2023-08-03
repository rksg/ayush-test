import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import {
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import AdaptivePolicyList, { AdaptivePolicyTabKey } from './index'

describe.skip('AdaptivePolicyList', () =>{
  const params = { tenantId: '_tenantId_' }

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const policiesPath = `/${params.tenantId}/t${getPolicyListRoutePath(true)}`

    render(<Provider><AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/></Provider>,
      { route: { params } })

    await screen.findByText('Adaptive Policy')

    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(await screen.findByRole('link', {
      name: 'Policies & Profiles' })).toHaveAttribute('href', policiesPath)
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const policiesPath = `/${params.tenantId}/t${getPolicyListRoutePath(true)}`

    render(<Provider><AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/></Provider>,
      { route: { params } })

    await screen.findByText('Adaptive Policy')

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(await screen.findByRole('link', {
      name: 'Policies & Profiles' })).toHaveAttribute('href', policiesPath)
  })
})
