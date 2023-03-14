import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { getPolicyRoutePath, PolicyOperation, PolicyType, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Path, To, useTenantLink }                                                  from '@acx-ui/react-router-dom'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, renderHook, screen }                                   from '@acx-ui/test-utils'

import { adaptivePolicyList, assignConditions, policySetList, templateList } from './__test__/fixtures'
import AdaptivePolicySetForm                                                 from './AdaptivePolicySetForm'

describe('AdaptivePolicySetForm', () => {
  // eslint-disable-next-line max-len
  const createPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })
  // eslint-disable-next-line max-len
  const editPath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.getPolicySetsByQuery.url,
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getConditionsInPolicy.url,
        (req, res, ctx) => res(ctx.json(assignConditions))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url,
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url,
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      )
    )
  })

  it('should render form successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await screen.findByText('Add Adaptive Policy Set')
    await screen.findByRole('button', { name: 'Apply' })
    await screen.findByRole('button', { name: 'Cancel' })
  })

  it('should submit list successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicySetForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: createPath
        }
      }
    )
    await screen.findByText('Add Adaptive Policy Set')

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Policy Name' }), 'testPolicy'
    )


  })

})
