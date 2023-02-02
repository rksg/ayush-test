import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import { mockServer, render, screen }   from '@acx-ui/test-utils'


import AdaptivePolicyTabs from './AdaptivePolicyTabs'
import { groupList }      from './RadiusAttributeGroup/RadiusAttributeGroupForm/__tests__/fixtures'

import { AdaptivePolicyTabKey } from './index'


describe('AdaptivePolicyTabs', () =>{

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      )
    )
  })

  const params = { tenantId: '_tenantId_', activeTab: AdaptivePolicyTabKey.ADAPTIVE_POLICY }

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicyTabs /></Provider>, { route: { params } })

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)

    await screen.findByText('Adaptive Policy (0)')
    await screen.findByText('Adaptive Policy Sets (0)')
    await screen.findByText('RADIUS Attribute Groups (' + groupList.content.length + ')')
  })

  it('should change tab correctly', async () => {
    render(<Provider><AdaptivePolicyTabs /></Provider>, { route: { params } })

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)

    await userEvent.click(await screen.findByText('Adaptive Policy Sets (0)'))
    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByText('RADIUS Attribute Groups (' + groupList.content.length + ')'))
  })

})
