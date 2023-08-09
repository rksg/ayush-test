import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within }         from '@acx-ui/test-utils'

import { adaptivePolicyList, attributeList, templateList, groupList, mockGroup } from './__test__/fixtures'
import { AdaptivePolicyFormDrawer }                                              from './AdaptivePolicyFormDrawer'


describe('AdaptivePolicyFormDrawer', () => {
  const mockedCloseDialog = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateAttributes.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(attributeList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(mockGroup))
      )
    )
  })

  it.skip('should add new policy successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RulesManagementUrlsInfo.createPolicy.url,
        (req, res, ctx) => res(ctx.json({
          id: 'policy_id'
        }))
      ),
      rest.post(
        RulesManagementUrlsInfo.addConditions.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <AdaptivePolicyFormDrawer
          setVisible={mockedCloseDialog}
          visible={true}/>
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
    let addBtns = await screen.findAllByText('Add')
    await userEvent.click(addBtns[0])

    await userEvent.click(await screen.findByRole('combobox', { name: 'Condition Type' }))
    await userEvent.click(await screen.findByText('NAS Identifier (Regex)'))
    const inputs = await screen.findAllByRole('textbox')
    expect(inputs).toHaveLength(5)
    await userEvent.type(inputs[4], 'testValue')

    addBtns = await screen.findAllByText('Add')
    await userEvent.click(addBtns[2])
    await screen.findByRole('row', { name: new RegExp('NAS Identifier') })

    // select group
    await userEvent.click(screen.getByText('Select Group'))
    await screen.findByText('Select RADIUS Attribute Group')

    const row = await screen.findByRole('row', { name: new RegExp(groupList.content[0].name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Select'))

    await screen.findByText('group1')

    await userEvent.click(addBtns[1])

    await screen.findByText('Policy testPolicy was added')
  })

})
