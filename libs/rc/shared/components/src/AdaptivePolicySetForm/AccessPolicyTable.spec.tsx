import { rest } from 'msw'

import { PolicyOperation, PolicyType, RulesManagementUrlsInfo, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                      from '@acx-ui/test-utils'

import { adaptivePolicyList, prioritizedPolicies, templateList } from './__tests__/fixtures'
import { AccessPolicyTable }                                     from './AccessPolicyTable'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  SimpleListTooltip: () => <div data-testid='SimpleListTooltip' />
}))
jest.mock('./AdaptivePolicySelectDrawer', () => ({
  AdaptivePoliciesSelectDrawer: () => <div data-testid='AdaptivePoliciesSelectDrawer' />
}))

const mockedSetAccessPolicies = jest.fn()

describe('AccessPolicyTable', () => {
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url.split('?')[0],
        (req, res, ctx) => {
          return res(ctx.json(prioritizedPolicies))
        }
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicyTemplateListByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      )
    )
  })

  it('should render AccessPolicyTable successfully', async () => {
    render(
      <Provider>
        <AccessPolicyTable
          accessPolicies={adaptivePolicyList.content}
          setAccessPolicies={mockedSetAccessPolicies}
          editMode={false}
        />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )

    expect(await screen.findByRole('row', { name: /ap1/i })).toBeVisible()
  })

  it('should render AccessPolicyTable in edit mode successfully', async () => {
    render(
      <Provider>
        <AccessPolicyTable
          accessPolicies={[]}
          setAccessPolicies={mockedSetAccessPolicies}
          editMode={true}
        />
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', policyId: 'policy-id' },
          path: editPath
        }
      }
    )

    await waitFor(() => expect(mockedSetAccessPolicies).toBeCalled())
  })
})
