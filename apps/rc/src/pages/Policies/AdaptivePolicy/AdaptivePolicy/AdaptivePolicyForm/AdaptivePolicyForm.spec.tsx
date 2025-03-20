import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi }         from '@acx-ui/rc/services'
import {
  RadiusAttributeGroupUrlsInfo,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved
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

const mockedUsedNavigate = jest.fn()
const mockAddConditions = jest.fn()
const mockCreatePolicy = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AdaptivePolicyForm', () => {
  beforeEach(() => {
    mockCreatePolicy.mockClear()
    mockAddConditions.mockClear()
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateAttributes.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(attributeList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPolicyTemplateListByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
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
    await screen.findByText('Add Adaptive Policy')
    await screen.findByText(templateList?.content[0]?.ruleType)
  })

  it('should render breadcrumb correctly', async () => {
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
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText(templateList?.content[0]?.ruleType)
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Adaptive Policy'
    })).toBeVisible()
  })

  it('should submit list successfully', async () => {
    mockServer.use(
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RulesManagementUrlsInfo.createPolicy.url,
        (req, res, ctx) => {
          mockCreatePolicy()
          return res(ctx.json({
            id: 'policy_id'
          }))
        }
      ),
      rest.post(
        RulesManagementUrlsInfo.addConditions.url,
        (req, res, ctx) => {
          mockAddConditions()
          return res(ctx.json({}))
        }
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(groupList.data[0]))
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

    // select policy type
    await userEvent.click(await screen.findByRole('radio', { name: /RADIUS/i }))

    // add condition
    await userEvent.click(screen.getByText('Add'))
    await screen.findByText('Add Access Condition')

    await userEvent.click(await screen.findByRole('combobox', { name: 'Condition Type' }))
    await userEvent.click(await screen.findByText('NAS Identifier (Regex)'))
    const inputs = await screen.findAllByRole('textbox')
    expect(inputs).toHaveLength(5)
    await userEvent.type(inputs[4], 'testValue')

    const addBtns = await screen.findAllByText('Add')
    await userEvent.click(addBtns[1])

    // select group
    await userEvent.click(screen.getByText('Select Group'))
    await screen.findByText('Select RADIUS Attribute Group')

    const row = await screen.findByRole('row', { name: new RegExp(groupList.data[0].name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Select'))

    await screen.findByText('group1')

    await userEvent.click(screen.getByText('Apply'))

    await waitFor(()=>{
      expect(mockCreatePolicy).toBeCalled()
    })
    await waitFor(()=>{
      expect(mockAddConditions).toBeCalled()
    })
    await screen.findByText('Policy testPolicy was added')

    expect(mockedUsedNavigate).toBeCalled()
  })

  it.skip('should edit giving data successfully', async () => {
    mockServer.use(
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyByTemplate.url.split('?')[0],
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
        RulesManagementUrlsInfo.getConditionsInPolicy.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(assignConditions))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(groupList.data[0]))
      ),
      rest.delete(
        RulesManagementUrlsInfo.deleteConditions.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.patch(
        RulesManagementUrlsInfo.updateConditions.url,
        (req, res, ctx) => res(ctx.json({}))
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
    let row = await screen.findByRole('row', { name: new RegExp(assignConditions.content[0].templateAttribute.name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Edit'))

    await screen.findByText('Edit Access Condition')
    let inputs = await screen.findAllByRole('textbox')
    expect(inputs).toHaveLength(5)
    await userEvent.type(inputs[4], 'testValueChange')
    await userEvent.click(screen.getByText('Done'))

    // eslint-disable-next-line max-len
    row = await screen.findByRole('row', { name: new RegExp(assignConditions.content[1].templateAttribute.name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Edit'))

    await screen.findByText('Edit Access Condition')
    await userEvent.click(screen.getByRole('radio', { name: 'Weekdays (Mon-Fri)' }))
    await userEvent.type(inputs[4], 'testValueChange')
    await userEvent.click(screen.getByText('Done'))

    // eslint-disable-next-line max-len
    row = await screen.findByRole('row', { name: new RegExp(assignConditions.content[2].templateAttribute.name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Delete'))
    await screen.findByText('Delete "' + assignConditions.content[2].templateAttribute.name + '"?')
    await userEvent.click(screen.getByText('Delete Condition'))

    await userEvent.click(screen.getByText('Apply'))

    await screen.findByText('Policy testPolicy was updated')
  })
})
