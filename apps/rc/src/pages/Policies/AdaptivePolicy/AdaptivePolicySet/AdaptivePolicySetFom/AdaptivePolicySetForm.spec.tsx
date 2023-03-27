import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import {
  adaptivePolicyList,
  assignConditions, editPolicySet,
  groupList,
  policySetList,
  prioritizedPolicies,
  templateList
} from './__test__/fixtures'
import AdaptivePolicySetForm from './AdaptivePolicySetForm'

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
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url,
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url,
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
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

  it('should create set successfully', async () => {
    mockServer.use(
      rest.post(
        RulesManagementUrlsInfo.createPolicySet.url,
        (req, res, ctx) => res(ctx.json({
          id: 'policy_id'
        }))
      ),
      rest.put(
        RulesManagementUrlsInfo.assignPolicyPriority.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

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

    // enter policy name
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Policy Name' }), 'testPolicy'
    )

    // select policies
    await userEvent.click(await screen.findByText('Select Policies'))
    // eslint-disable-next-line max-len
    let row = await screen.findByRole('row', { name: new RegExp(adaptivePolicyList.content[0].name) })
    fireEvent.click(within(row).getByRole('switch'))
    row = await screen.findByRole('row', { name: new RegExp(adaptivePolicyList.content[1].name) })
    fireEvent.click(within(row).getByRole('switch'))
    await userEvent.click(screen.getByText('Add'))

    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: new RegExp( '1 ' + adaptivePolicyList.content[0].name) })

    await userEvent.click(screen.getByText('Apply'))
    await screen.findByText('Policy Set testPolicy was added')
  })

  it('should edit set successfully', async () => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySet.url,
        (req, res, ctx) => res(ctx.json(editPolicySet))
      ),
      rest.patch(
        RulesManagementUrlsInfo.updatePolicySet.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        RulesManagementUrlsInfo.assignPolicyPriority.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        RulesManagementUrlsInfo.removePrioritizedAssignment.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <AdaptivePolicySetForm editMode={true}/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', policyId: 'policy_id' },
          path: editPath
        }
      }
    )
    await screen.findByText('Configure ' + editPolicySet.name)
    await screen.findByRole('textbox', { name: 'Policy Name' })

    await userEvent.click(await screen.findByText('Select Policies'))

    // unselect policy
    // eslint-disable-next-line max-len
    const rows = await screen.findAllByRole('row', { name: new RegExp(adaptivePolicyList.content[0].name) })
    fireEvent.click(within(rows[1]).getByRole('switch'))

    // select policy
    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: new RegExp(adaptivePolicyList.content[1].name) })
    fireEvent.click(within(row).getByRole('switch'))

    await userEvent.click(screen.getByText('Add'))

    // eslint-disable-next-line max-len
    await screen.findByRole('row', { name: new RegExp( '1 ' + adaptivePolicyList.content[1].name) })

    await userEvent.click(screen.getByText('Apply'))
    await screen.findByText('Policy Set aps1 was updated')
  })

})
