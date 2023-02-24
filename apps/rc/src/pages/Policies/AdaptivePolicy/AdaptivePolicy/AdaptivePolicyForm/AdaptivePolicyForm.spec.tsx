import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  RadiusAttributeGroupUrlsInfo,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'


import {
  adaptivePolicyList,
  assignConditions,
  attributeList,
  editAdaptivePolicy,
  groupList,
  templateList
} from './__test__/fixtures'
import AdaptivePolicyForm from './AdaptivePolicyForm'

describe('AdaptivePolicyForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateAttributes.url,
        (req, res, ctx) => res(ctx.json(attributeList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url,
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url,
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      )
    )
  })

  it('should render form successfully', async () => {
    render(
      <Provider>
        <AdaptivePolicyForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: '/:tenantId'
        }
      }
    )
  })

  it('should submit list successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RulesManagementUrlsInfo.createPolicy.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        RulesManagementUrlsInfo.addConditions.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <AdaptivePolicyForm/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id' },
          path: '/:tenantId'
        }
      }
    )

    // set policy name
    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Policy Name' }), 'testPolicy'
    )

    // add condition
    await userEvent.click(screen.getByText('Add'))
    await screen.findByText('Add Access Condition')

    await userEvent.click(screen.getByRole('combobox', { name: 'Condition Type' }))
    await userEvent.click(await screen.findByText('NAS Identifier'))
    const inputs = await screen.findAllByRole('textbox')
    expect(inputs).toHaveLength(5)
    await userEvent.type(inputs[4], 'testValue')

    const addBtns = await screen.findAllByText('Add')
    await userEvent.click(addBtns[1])

    // select group
    await userEvent.click(screen.getByText('Select Group'))
    await screen.findByText('Select RADIUS Attribute Group')

    const row = await screen.findByRole('row', { name: new RegExp(groupList.content[0].name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Select'))

    await screen.findByText('Change Group')

    await userEvent.click(screen.getByText('Apply'))

    await screen.findByText('Policy testPolicy was added')
  })

  it('should edit giving data successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyByTemplate.url,
        (req, res, ctx) => res(ctx.json(editAdaptivePolicy))
      ),
      rest.patch(
        RulesManagementUrlsInfo.updatePolicy.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        RulesManagementUrlsInfo.addConditions.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        RulesManagementUrlsInfo.getConditionsInPolicy.url,
        (req, res, ctx) => res(ctx.json(assignConditions))
      )
    )

    render(
      <Provider>
        <AdaptivePolicyForm editMode={true}/>
      </Provider>, {
        route: {
          params: { tenantId: 'tenant-id', templateId: '200', policyId: editAdaptivePolicy.id },
          path: '/:tenantId/:templateId/:policyId'
        }
      }
    )
    await screen.findByText('Configure ' + editAdaptivePolicy.name)

    const policyInput = await screen.findByRole('textbox', { name: 'Policy Name' })
    expect(policyInput).toHaveValue(editAdaptivePolicy.name)

    await userEvent.clear(policyInput)
    await userEvent.type(policyInput, 'testPolicy')

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: new RegExp(assignConditions.content[0].name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Edit'))

    await screen.findByText('Edit Access Condition')
    await userEvent.click(screen.getByText('Done'))

    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Delete'))

    await screen.findByText('Delete "' + assignConditions.content[0].name + '"?')
    await userEvent.click(screen.getByText('Delete Attribute'))

    await userEvent.click(screen.getByText('Apply'))

    await screen.findByText('Policy testPolicy was updated')
  })
})
