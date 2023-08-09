import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen }                            from '@acx-ui/test-utils'


import AdaptivePolicyTabs from './AdaptivePolicyTabs'
import { groupList }      from './RadiusAttributeGroup/RadiusAttributeGroupForm/__tests__/fixtures'

import { AdaptivePolicyTabKey } from './index'

export const adaptivePolicyList = {
  paging: {
    totalCount: 1,
    page: 1,
    pageSize: 1,
    pageCount: 1
  },
  content: [
    {
      id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      name: 'test1',
      description: 'for test',
      policyType: 'RADIUS',
      onMatchResponse: 'test'
    }
  ]
}

export const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12'
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2'
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4'
    }
  ]
}

describe('AdaptivePolicyTabs', () =>{

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      )
    )
  })

  const params = { tenantId: '_tenantId_', activeTab: AdaptivePolicyTabKey.ADAPTIVE_POLICY }

  it('should render correctly', async () => {
    render(<Provider>
      <AdaptivePolicyTabs activeTab={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}/>
    </Provider>,
    { route: { params } })

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)

    await screen.findByText('Adaptive Policy (0)')
    const setTab = await screen.findByText('Adaptive Policy Sets (0)')
    // eslint-disable-next-line max-len
    const attributeTab = await screen.findByText('RADIUS Attribute Groups (' + groupList.content.length + ')')

    await userEvent.click(setTab)
    await userEvent.click(attributeTab)
  })

})
